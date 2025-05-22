import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { apiRequest } from '@/lib/queryClient';

interface VoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExpenseParsed: (expense: { amount?: number; category?: string; description?: string }) => void;
}

export function VoiceModal({ open, onOpenChange, onExpenseParsed }: VoiceModalProps) {
  const { toast } = useToast();
  const { transcript, isListening, isSupported, startListening, stopListening, error } = useVoiceInput();
  const [isProcessing, setIsProcessing] = useState(false);

  const parseVoiceMutation = useMutation({
    mutationFn: async (voiceText: string) => {
      const response = await apiRequest('POST', '/api/voice/parse', { voiceText });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success && data.amount && data.category) {
        onExpenseParsed({
          amount: data.amount,
          category: data.category,
          description: data.description,
        });
        toast({
          title: "Voice Input Parsed!",
          description: `₦${data.amount} for ${data.category}`,
        });
        onOpenChange(false);
      } else {
        toast({
          title: "Could not parse voice input",
          description: data.error || "Please try again with a clearer command",
          variant: "destructive",
        });
      }
      setIsProcessing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Voice parsing failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
      setIsProcessing(false);
    },
  });

  useEffect(() => {
    if (transcript && !isListening) {
      setIsProcessing(true);
      parseVoiceMutation.mutate(transcript);
    }
  }, [transcript, isListening]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Voice recognition error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  if (!isSupported) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-sm">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-microphone-slash text-red-500 text-xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Voice Input Not Supported
            </h3>
            <p className="text-gray-600 mb-4">
              Your browser doesn't support voice recognition. Please use a modern browser like Chrome or Safari.
            </p>
            <Button onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <div className="text-center p-6">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isListening ? 'bg-red-50 animate-pulse' : 'bg-blue-50'
          }`}>
            <i className={`fas fa-microphone text-2xl ${
              isListening ? 'text-red-500' : 'text-blue-500'
            }`}></i>
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Voice Input
          </h3>
          
          <p className="text-gray-600 mb-6">
            Say something like "Add 5000 to Transport" or "Spent 2500 on lunch"
          </p>
          
          {transcript && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-700">
                <strong>Heard:</strong> "{transcript}"
              </p>
            </div>
          )}
          
          <div className="space-y-4">
            {isListening ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                </div>
                <p className="text-sm text-gray-600">Listening...</p>
                <Button 
                  variant="outline" 
                  onClick={stopListening}
                  className="w-full"
                >
                  Stop Listening
                </Button>
              </div>
            ) : isProcessing ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <i className="fas fa-spinner fa-spin text-blue-500 text-xl"></i>
                </div>
                <p className="text-sm text-gray-600">Processing...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Button 
                  onClick={startListening}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  <i className="fas fa-microphone mr-2"></i>
                  Start Listening
                </Button>
                
                {transcript && (
                  <Button 
                    variant="outline"
                    onClick={() => parseVoiceMutation.mutate(transcript)}
                    disabled={parseVoiceMutation.isPending}
                    className="w-full"
                  >
                    {parseVoiceMutation.isPending ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-redo mr-2"></i>
                        Try Parse Again
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
            
            <Button 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
