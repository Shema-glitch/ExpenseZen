import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { insertExpenseSchema, type InsertExpense } from '@shared/schema';

interface AddExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: Partial<InsertExpense>;
}

const categories = [
  'Food & Dining',
  'Transport',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Health',
  'Education',
  'Other'
];

export function AddExpenseModal({ open, onOpenChange, defaultValues }: AddExpenseModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<InsertExpense>({
    resolver: zodResolver(insertExpenseSchema),
    defaultValues: {
      amount: '',
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      ...defaultValues,
    },
  });

  const createExpenseMutation = useMutation({
    mutationFn: async (data: InsertExpense) => {
      const response = await apiRequest('POST', '/api/expenses', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/insights'] });
      
      toast({
        title: "Expense Added!",
        description: `₦${form.getValues('amount')} for ${form.getValues('description')}`,
      });
      
      form.reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add expense",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertExpense) => {
    createExpenseMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add Expense</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Amount */}
          <div>
            <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
              Amount
            </Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                ₦
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                className="pl-8"
                {...form.register('amount')}
              />
            </div>
            {form.formState.errors.amount && (
              <p className="text-red-500 text-xs mt-1">
                {form.formState.errors.amount.message}
              </p>
            )}
          </div>
          
          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description
            </Label>
            <Input
              id="description"
              placeholder="What did you spend on?"
              className="mt-1"
              {...form.register('description')}
            />
            {form.formState.errors.description && (
              <p className="text-red-500 text-xs mt-1">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>
          
          {/* Category */}
          <div>
            <Label htmlFor="category" className="text-sm font-medium text-gray-700">
              Category
            </Label>
            <Select
              value={form.watch('category')}
              onValueChange={(value) => form.setValue('category', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.category && (
              <p className="text-red-500 text-xs mt-1">
                {form.formState.errors.category.message}
              </p>
            )}
          </div>
          
          {/* Date */}
          <div>
            <Label htmlFor="date" className="text-sm font-medium text-gray-700">
              Date
            </Label>
            <Input
              id="date"
              type="date"
              className="mt-1"
              {...form.register('date')}
            />
            {form.formState.errors.date && (
              <p className="text-red-500 text-xs mt-1">
                {form.formState.errors.date.message}
              </p>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={createExpenseMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={createExpenseMutation.isPending}
            >
              {createExpenseMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Adding...
                </>
              ) : (
                'Add Expense'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
