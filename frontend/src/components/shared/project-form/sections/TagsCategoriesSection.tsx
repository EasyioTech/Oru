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
    <div className="space-y-4">
      <h3 className="font-semibold text-sm">Tags & Categories</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex gap-2">
            <Input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} placeholder="Enter tag and press Enter" />
            <Button type="button" onClick={addTag} variant="outline" size="icon"><Plus className="h-4 w-4" /></Button>
          </div>
          {formData.tags && formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag, i) => (
                <Badge key={i} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"><X className="h-3 w-3" /></button>
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Label>Categories</Label>
          <div className="flex gap-2">
            <Input value={categoryInput} onChange={e => setCategoryInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCategory(); } }} placeholder="Enter category and press Enter" />
            <Button type="button" onClick={addCategory} variant="outline" size="icon"><Plus className="h-4 w-4" /></Button>
          </div>
          {formData.categories && formData.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.categories.map((cat, i) => (
                <Badge key={i} variant="secondary" className="flex items-center gap-1">
                  {cat}
                  <button type="button" onClick={() => removeCategory(cat)} className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"><X className="h-3 w-3" /></button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
