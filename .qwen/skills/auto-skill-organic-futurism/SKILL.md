---
name: organic-futurism
description: Apply Organic Futurism aesthetic to UI components and styling
extracted_at: '2026-06-23T08:55:35.102Z'
source: auto-skill
---

## Approach

1. **Identify UI Components**:
   - Focus on form components (`Input`, `Textarea`, `Select`, `Badge`, `Progress`)
   - Target cards and layout elements for consistent styling

2. **Create Custom CSS Classes**:
   - Add organic border, shadow, gradient, and hover effects to `index.css`
   - Implement transition and pulse animations

3. **Apply Styling**:
   - Update component classes to use new organic styles
   - Ensure consistent visual feedback across all interactive elements

4. **Test and Refine**:
   - Verify all components render correctly with new styles
   - Ensure responsive behavior on different screen sizes

5. **Document Changes**:
   - Commit with clear message about the aesthetic transformation
   - Push to remote repository

## Implementation Steps

1. **Update CSS**:
   ```css
   .organic-border {
     border: 1px solid hsl(var(--primary)/0.1);
     border-radius: 0.75rem;
     box-shadow: 0 4px 6px -1px hsl(var(--primary)/0.1),
               0 2px 4px -1px hsl(var(--primary)/0.06);
   }
   ```

2. **Update Components**:
   ```tsx
   <input className={cn(
     'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 organic-input-border organic-input-shadow organic-transition organic-input-hover',
     className
   )} />
   ```

3. **Commit and Push**:
   ```bash
   git add .
   git commit -m "style: apply organic futurism aesthetic to UI components"
   git push
   ```

## Notes
- This skill focuses on creating a cohesive, distinctive visual language
- All changes maintain functionality while improving visual appeal
- The approach ensures consistent styling across all interactive elements