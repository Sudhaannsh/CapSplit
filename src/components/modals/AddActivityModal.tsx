import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Loader2, Upload, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWallet } from '@/contexts/WalletContext';
import { useImageUpload } from '@/hooks/useImageUpload';
import { toast } from 'sonner';

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddActivityModal({ isOpen, onClose }: AddActivityModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetBudget, setTargetBudget] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { addActivity, getFreeActivityCount } = useWallet();
  const { uploadImage, uploading } = useImageUpload();
  
  const freeLimit = 3;
  const freeCount = getFreeActivityCount();
  const isFree = freeCount < freeLimit;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Please enter a name for your activity');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let imageUrl: string | undefined;
      
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          toast.error('Failed to upload image');
          setIsSubmitting(false);
          return;
        }
      }
      
      const success = await addActivity({
        name: name.trim(),
        description: description.trim() || undefined,
        targetBudget: parseFloat(targetBudget) || 0,
        imageUrl,
        isPaid: !isFree,
      });
      
      if (success) {
        toast.success(`Activity "${name}" created!`);
        setName('');
        setDescription('');
        setTargetBudget('');
        removeImage();
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 safe-bottom"
          >
            <div className="glass-card mx-4 mb-4 p-6 rounded-3xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display font-bold">New Activity</h2>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-muted rounded-xl transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {!isFree && (
                <div className="mb-4 p-3 rounded-xl bg-warning/10 border border-warning/20">
                  <p className="text-sm text-warning">
                    This will be your {freeCount + 1}th activity. A fee of ₹19 will apply.
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium mb-2 block">
                    Activity Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Vacation Fund"
                    className="h-12"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium mb-2 block">
                    Description (Optional)
                  </Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What's this activity for?"
                    className="h-12"
                  />
                </div>

                <div>
                  <Label htmlFor="budget" className="text-sm font-medium mb-2 block">
                    Target Budget (Optional)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                    <Input
                      id="budget"
                      type="number"
                      value={targetBudget}
                      onChange={(e) => setTargetBudget(e.target.value)}
                      placeholder="0"
                      className="h-12 pl-8"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Activity Image (Optional)
                  </Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  {imagePreview ? (
                    <div className="relative rounded-xl overflow-hidden">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-32 object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-1.5 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-24 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-muted/50 transition-colors"
                    >
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Click to upload image</span>
                    </button>
                  )}
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full"
                  variant="wallet"
                  size="lg"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Plus className="h-5 w-5" />
                      {isFree ? 'Create Activity' : 'Pay ₹19 & Create'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
