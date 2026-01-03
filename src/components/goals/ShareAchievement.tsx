import { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Copy, Check, Download, Trophy } from 'lucide-react';
import { Achievement } from '@/types/goals';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface ShareAchievementProps {
  achievement: Achievement;
}

export const ShareAchievement = ({ achievement }: ShareAchievementProps) => {
  const [copied, setCopied] = useState(false);

  const shareText = `Just unlocked "${achievement.title}" on Solo Leveling! ${achievement.description}`;
  
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleDownloadImage = () => {
    // Create a simple achievement card as canvas
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 600, 300);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 300);

    // Achievement icon circle
    ctx.beginPath();
    ctx.arc(300, 100, 40, 0, Math.PI * 2);
    ctx.fillStyle = achievement.color + '40';
    ctx.fill();
    ctx.strokeStyle = achievement.color;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(achievement.title, 300, 180);

    // Description
    ctx.fillStyle = '#888888';
    ctx.font = '16px Inter, sans-serif';
    ctx.fillText(achievement.description, 300, 210);

    // Solo Leveling branding
    ctx.fillStyle = '#666666';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText('Solo Leveling', 300, 270);

    // Download
    const link = document.createElement('a');
    link.download = `achievement-${achievement.id}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    toast.success('Achievement card downloaded!');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: achievement.title,
          text: shareText,
        });
      } catch (e) {
        // User cancelled or error
      }
    } else {
      handleCopyText();
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" className="h-8 w-8">
          <Share2 className="w-3.5 h-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Achievement</DialogTitle>
        </DialogHeader>
        
        {/* Preview Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-xl text-center"
          style={{ 
            background: `linear-gradient(135deg, ${achievement.color}15, ${achievement.color}05)`,
            border: `1px solid ${achievement.color}30`
          }}
        >
          <div 
            className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center"
            style={{ backgroundColor: `${achievement.color}20` }}
          >
            <Trophy className="w-8 h-8" style={{ color: achievement.color }} />
          </div>
          <h3 className="font-semibold text-lg">{achievement.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{achievement.description}</p>
          <p className="text-xs text-muted-foreground/60 mt-3">Solo Leveling</p>
        </motion.div>

        {/* Share Options */}
        <div className="flex gap-2 mt-2">
          <Button 
            variant="outline" 
            className="flex-1 gap-2"
            onClick={handleCopyText}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Text'}
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 gap-2"
            onClick={handleDownloadImage}
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
          <Button 
            className="flex-1 gap-2"
            onClick={handleNativeShare}
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
