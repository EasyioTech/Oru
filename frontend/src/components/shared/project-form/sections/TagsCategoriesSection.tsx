import { Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type UseProjectFormReturn } from '../useProjectForm';

interface TagsCategoriesSectionProps {
  ctx: Pick<UseProjectFormReturn, 'formData' | 'tagInput' | 'setTagInput' | 'categoryInput' | 'setCategoryInput' | 'addTag' | 'removeTag' | 'addCategory' | 'removeCategory'>;
}

export function TagsCategoriesSection({ ctx }: TagsCategoriesSectionProps) {
  const { formData, tagInput, setTagInput, categoryInput, setCategoryInput, addTag, removeTag, addCategory, removeCategory } = ctx;
  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-lg text-foreground">Tags & Categories</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <Label className="text-sm font-medium">Tags</Label>
          <div className="flex gap-3">
            <Input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} placeholder="Enter tag and press Enter" className="h-11" />
            <Button type="button" onClick={addTag} variant="outline" size="icon" className="h-11 w-11 shrink-0"><Plus className="h-5 w-5" /></Button>
          </div>
          {formData.tags && formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2.5 pt-2">
              {formData.tags.map((tag, i) => (
                <Badge key={i} variant="secondary" className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:bg-destructive/20 text-muted-foreground hover:text-destructive rounded-full p-0.5 transition-colors"><X className="h-3.5 w-3.5" /></button>
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-3">
          <Label className="text-sm font-medium">Categories</Label>
          <div className="flex gap-3">
            <Input value={categoryInput} onChange={e => setCategoryInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCategory(); } }} placeholder="Enter category and press Enter" className="h-11" />
            <Button type="button" onClick={addCategory} variant="outline" size="icon" className="h-11 w-11 shrink-0"><Plus className="h-5 w-5" /></Button>
          </div>
          {formData.categories && formData.categories.length > 0 && (
            <div className="flex flex-wrap gap-2.5 pt-2">
              {formData.categories.map((cat, i) => (
                <Badge key={i} variant="secondary" className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium">
                  {cat}
                  <button type="button" onClick={() => removeCategory(cat)} className="ml-1 hover:bg-destructive/20 text-muted-foreground hover:text-destructive rounded-full p-0.5 transition-colors"><X className="h-3.5 w-3.5" /></button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
