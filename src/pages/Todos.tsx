import { useState, useMemo, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Plus, Trash2, Loader2, CheckCircle2, Circle, X, Tag, Filter, ArrowUpDown, Edit } from 'lucide-react';
import { useTodos, useCreateTodo, useToggleTodo, useDeleteTodo, useUpdateTodo } from '@/hooks/api/useTodos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Todo, TodoPriority, TodoSortBy, TodoSortOrder } from '@/lib/api/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const priorityColors: Record<TodoPriority, string> = {
  LOW: 'text-blue-600 dark:text-blue-400',
  MEDIUM: 'text-yellow-600 dark:text-yellow-400',
  HIGH: 'text-red-600 dark:text-red-400',
};

const priorityOrder: Record<TodoPriority, number> = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  isToggling: boolean;
}

const TodoItem = ({ todo, onToggle, onEdit, onDelete, isToggling }: TodoItemProps) => {
  return (
    <div
      className={cn(
        "group flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors",
        todo.completed && "opacity-60"
      )}
    >
      {/* Checkbox */}
      <div className="pt-0.5 flex-shrink-0">
        <Checkbox
          checked={todo.completed}
          onCheckedChange={() => onToggle(todo.id)}
          disabled={isToggling}
          className="w-4 h-4"
        />
      </div>

      {/* Todo Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-muted-foreground mb-1">
          <span className={cn('font-medium uppercase text-[10px] sm:text-xs', priorityColors[todo.priority])}>
            {todo.priority}
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline truncate">
            {todo.completed && todo.completedAt
              ? `Updated ${formatDistanceToNow(new Date(todo.completedAt), { addSuffix: true })}`
              : `Created ${formatDistanceToNow(new Date(todo.createdAt), { addSuffix: true })}`}
          </span>
        </div>

        <p
          className={cn(
            "text-sm font-medium break-words pr-16 sm:pr-0",
            todo.completed && "line-through text-muted-foreground"
          )}
        >
          {todo.title}
        </p>

        {/* Tags */}
        {todo.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {todo.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-[10px] sm:text-xs gap-1 h-4 sm:h-5 px-1.5"
              >
                <Tag className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Edit and Delete Buttons */}
      <div className="flex sm:opacity-0 sm:group-hover:opacity-100 transition-opacity items-start gap-0.5 sm:gap-1 absolute right-2 top-2 sm:relative sm:right-auto sm:top-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(todo)}
          className="h-6 w-6 sm:h-7 sm:w-7 p-0 hover:bg-primary/10 hover:text-primary"
        >
          <Edit className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(todo.id)}
          className="h-6 w-6 sm:h-7 sm:w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </Button>
      </div>
    </div>
  );
};

const Todos = () => {
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState<TodoPriority>('MEDIUM');
  const [newTodoTags, setNewTodoTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [deletingTodoId, setDeletingTodoId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  
  // Filters, sorting, and pagination
  const [filterCompleted, setFilterCompleted] = useState<boolean | undefined>(undefined);
  const [filterPriority, setFilterPriority] = useState<TodoPriority | undefined>(undefined);
  const [sortBy, setSortBy] = useState<TodoSortBy>('createdAt');
  const [sortOrder, setSortOrder] = useState<TodoSortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Build filters object for API
  const filters = useMemo(() => ({
    completed: filterCompleted,
    priority: filterPriority,
    sortBy,
    sortOrder,
    page: currentPage,
    limit: pageSize,
  }), [filterCompleted, filterPriority, sortBy, sortOrder, currentPage, pageSize]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterCompleted, filterPriority, sortBy, sortOrder]);

  const { data: todosResponse, isLoading } = useTodos(filters);
  const todos = useMemo(() => todosResponse?.todos || [], [todosResponse]);
  const totalTodos = useMemo(() => todosResponse?.total || 0, [todosResponse]);
  const totalPages = useMemo(() => todosResponse?.totalPages || 1, [todosResponse]);
  const createTodo = useCreateTodo();
  const toggleTodo = useToggleTodo();
  const deleteTodo = useDeleteTodo();
  const updateTodo = useUpdateTodo();

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const tag = tagInput.trim();
      if (tag && !newTodoTags.includes(tag)) {
        setNewTodoTags([...newTodoTags, tag]);
        setTagInput('');
      }
    }
  };

  const handleRemoveNewTag = (tagToRemove: string) => {
    setNewTodoTags(newTodoTags.filter(tag => tag !== tagToRemove));
  };

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    try {
      await createTodo.mutateAsync({
        title: newTodoTitle.trim(),
        priority: newTodoPriority,
        tags: newTodoTags.length > 0 ? newTodoTags : undefined,
      });
      setNewTodoTitle('');
      setNewTodoPriority('MEDIUM');
      setNewTodoTags([]);
      setTagInput('');
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Failed to create todo:', error);
    }
  };

  const handleUpdateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTodo || !newTodoTitle.trim()) return;

    try {
      await updateTodo.mutateAsync({
        id: editingTodo.id,
        data: {
          title: newTodoTitle.trim(),
          priority: newTodoPriority,
          tags: newTodoTags,
        },
      });
      setEditingTodo(null);
      setNewTodoTitle('');
      setNewTodoPriority('MEDIUM');
      setNewTodoTags([]);
      setTagInput('');
    } catch (error) {
      console.error('Failed to update todo:', error);
    }
  };

  const handleEditClick = (todo: Todo) => {
    setEditingTodo(todo);
    setNewTodoTitle(todo.title);
    setNewTodoPriority(todo.priority);
    setNewTodoTags([...todo.tags]);
    setTagInput('');
  };

  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
    setEditingTodo(null);
    setNewTodoTitle('');
    setNewTodoPriority('MEDIUM');
    setNewTodoTags([]);
    setTagInput('');
  };

  const handleToggleTodo = async (todoId: string) => {
    try {
      await toggleTodo.mutateAsync(todoId);
    } catch (error) {
      console.error('Failed to toggle todo:', error);
    }
  };

  const handleDeleteTodo = async () => {
    if (!deletingTodoId) return;
    
    try {
      await deleteTodo.mutateAsync(deletingTodoId);
      setDeletingTodoId(null);
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  // Separate active and completed todos (already filtered by API)
  const { activeTodos, completedTodos } = useMemo(() => {
    if (!todos || todos.length === 0) return { activeTodos: [], completedTodos: [] };

    const active: Todo[] = [];
    const completed: Todo[] = [];

    todos.forEach(todo => {
      if (todo.completed) {
        completed.push(todo);
      } else {
        active.push(todo);
      }
    });

    return {
      activeTodos: active,
      completedTodos: completed,
    };
  }, [todos]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading todos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 sm:h-14 sm:py-0">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-foreground">Todos</h1>
              {todos && todos.length > 0 && (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Circle className="w-3.5 h-3.5" />
                    <span>{activeTodos.length}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{completedTodos.length}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Add Todo Button and Filters */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2">
          <Dialog open={isAddDialogOpen || !!editingTodo} onOpenChange={(open) => {
            if (!open) handleCloseDialog();
            else if (!editingTodo) setIsAddDialogOpen(true);
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Todo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <form onSubmit={editingTodo ? handleUpdateTodo : handleCreateTodo}>
                <DialogHeader className="pb-4">
                  <DialogTitle className="text-lg sm:text-xl">{editingTodo ? 'Edit Todo' : 'Add New Todo'}</DialogTitle>
                  <DialogDescription className="text-sm">
                    {editingTodo ? 'Update your todo item.' : 'Create a new todo item with priority and tags.'}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 sm:gap-4 py-2 sm:py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title" className="text-sm">Title</Label>
                    <Input
                      id="title"
                      placeholder="What needs to be done?"
                      value={newTodoTitle}
                      onChange={(e) => setNewTodoTitle(e.target.value)}
                      disabled={createTodo.isPending || updateTodo.isPending}
                      autoFocus
                      className="text-sm"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="priority" className="text-sm">Priority</Label>
                    <Select
                      value={newTodoPriority}
                      onValueChange={(value) => setNewTodoPriority(value as TodoPriority)}
                      disabled={createTodo.isPending || updateTodo.isPending}
                    >
                      <SelectTrigger id="priority" className="text-sm">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tags" className="text-sm">Tags</Label>
                    <Input
                      id="tags"
                      placeholder="Type a tag and press Enter"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      disabled={createTodo.isPending || updateTodo.isPending}
                      className="text-sm"
                    />
                    {newTodoTags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {newTodoTags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-[10px] sm:text-xs gap-1 pr-1"
                          >
                            <Tag className="w-3 h-3" />
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveNewTag(tag)}
                              className="hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseDialog}
                    disabled={createTodo.isPending || updateTodo.isPending}
                    className="w-full sm:w-auto text-sm"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={!newTodoTitle.trim() || createTodo.isPending || updateTodo.isPending}
                    className="gap-2 w-full sm:w-auto text-sm"
                  >
                    {(createTodo.isPending || updateTodo.isPending) ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {editingTodo ? 'Updating...' : 'Adding...'}
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        {editingTodo ? 'Update Todo' : 'Add Todo'}
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <div className="hidden sm:block sm:flex-1" />

          {/* Filters and Sorting */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground hidden sm:block" />
          </div>

          <Select 
            value={filterPriority || 'all'} 
            onValueChange={(v: string) => setFilterPriority(v === 'all' ? undefined : v as TodoPriority)}
          >
            <SelectTrigger className="w-full sm:w-28 h-8 text-sm">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            value={filterCompleted === undefined ? 'all' : filterCompleted ? 'completed' : 'active'} 
            onValueChange={(v: string) => {
              if (v === 'all') setFilterCompleted(undefined);
              else if (v === 'completed') setFilterCompleted(true);
              else setFilterCompleted(false);
            }}
          >
            <SelectTrigger className="w-full sm:w-28 h-8 text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 h-8 text-sm px-3 w-full sm:w-auto">
                <ArrowUpDown className="w-3.5 h-3.5" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortBy('createdAt')}>
                Created Date {sortBy === 'createdAt' && '✓'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('updatedAt')}>
                Updated Date {sortBy === 'updatedAt' && '✓'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('priority')}>
                Priority {sortBy === 'priority' && '✓'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('title')}>
                Title {sortBy === 'title' && '✓'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Order</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortOrder('asc')}>
                Ascending {sortOrder === 'asc' && '✓'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder('desc')}>
                Descending {sortOrder === 'desc' && '✓'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Active Todos List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Active</h2>
          {activeTodos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-border rounded-lg">
              <CheckCircle2 className="w-12 h-12 mb-3 text-muted-foreground/50" />
              <h3 className="text-sm font-semibold mb-1">No active todos</h3>
              <p className="text-xs text-muted-foreground">
                {todos && todos.length > 0 
                  ? 'All tasks are completed!'
                  : 'Add your first todo to get started!'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={handleToggleTodo}
                  onEdit={handleEditClick}
                  onDelete={setDeletingTodoId}
                  isToggling={toggleTodo.isPending}
                />
              ))}
            </div>
          )}
        </div>

        {/* Completed Todos Section */}
        {completedTodos.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              Completed ({completedTodos.length})
            </h2>
            <div className="space-y-2">
              {completedTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={handleToggleTodo}
                  onEdit={handleEditClick}
                  onDelete={setDeletingTodoId}
                  isToggling={toggleTodo.isPending}
                />
              ))}
            </div>
          </div>
        )}

        {/* Pagination Controls */}
        {totalTodos > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalTodos)} of {totalTodos} todos
            </div>
            
            <div className="flex items-center gap-2">
              <Select 
                value={pageSize.toString()} 
                onValueChange={(v) => {
                  setPageSize(Number(v));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-24 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 / page</SelectItem>
                  <SelectItem value="25">25 / page</SelectItem>
                  <SelectItem value="50">50 / page</SelectItem>
                  <SelectItem value="100">100 / page</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || isLoading}
                >
                  Previous
                </Button>
                
                <div className="px-3 py-1 text-sm">
                  Page {currentPage} of {totalPages}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages || isLoading}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingTodoId} onOpenChange={(open) => !open && setDeletingTodoId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Todo</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this todo? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTodo}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Todos;
