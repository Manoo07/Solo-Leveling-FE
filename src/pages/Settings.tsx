import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { 
  User, Bell, Database,
  Moon, Sun, Monitor, Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  const [profile, setProfile] = useState({
    name: 'User',
    email: '',
    timezone: 'America/New_York',
    locale: 'en-US',
  });

  const [notifications, setNotifications] = useState({
    dailyReminder: true,
    weeklyDigest: false,
    achievementAlerts: true,
    emailNotifications: false,
  });

  const [appearance, setAppearance] = useState({
    compactMode: false,
  });

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSaveProfile = () => {
    toast.success('Profile settings saved');
  };

  const handleSaveNotifications = () => {
    toast.success('Notification preferences saved');
  };

  const handleExportData = () => {
    const data = {
      habits: localStorage.getItem('solo-leveling_v2'),
      goals: localStorage.getItem('solo-leveling-goals'),
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solo-leveling-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  const handleClearData = () => {
    if (confirm('Are you sure? This will delete all your habits and goals.')) {
      localStorage.removeItem('solo-leveling_v2');
      localStorage.removeItem('solo-leveling-goals');
      toast.success('All data cleared');
      window.location.reload();
    }
  };

  const themeOptions = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-lg">
          <TabsTrigger value="profile" className="gap-1.5 text-xs sm:text-sm">
            <User className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5 text-xs sm:text-sm">
            <Bell className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-1.5 text-xs sm:text-sm">
            <Sun className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-1.5 text-xs sm:text-sm">
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Data</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Profile Settings</CardTitle>
                <CardDescription>
                  Manage your personal information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile(p => ({ ...p, email: e.target.value }))}
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select 
                      value={profile.timezone}
                      onValueChange={(v) => setProfile(p => ({ ...p, timezone: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="Europe/London">London</SelectItem>
                        <SelectItem value="Europe/Paris">Paris</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="locale">Language</Label>
                    <Select 
                      value={profile.locale}
                      onValueChange={(v) => setProfile(p => ({ ...p, locale: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="en-GB">English (UK)</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="pt-4">
                  <Button onClick={handleSaveProfile} className="gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how and when you want to be notified
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Daily Reminder</p>
                      <p className="text-xs text-muted-foreground">Get reminded to track your habits</p>
                    </div>
                    <Switch
                      checked={notifications.dailyReminder}
                      onCheckedChange={(v) => setNotifications(n => ({ ...n, dailyReminder: v }))}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Weekly Digest</p>
                      <p className="text-xs text-muted-foreground">Summary of your weekly progress</p>
                    </div>
                    <Switch
                      checked={notifications.weeklyDigest}
                      onCheckedChange={(v) => setNotifications(n => ({ ...n, weeklyDigest: v }))}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Achievement Alerts</p>
                      <p className="text-xs text-muted-foreground">Celebrate when you earn badges</p>
                    </div>
                    <Switch
                      checked={notifications.achievementAlerts}
                      onCheckedChange={(v) => setNotifications(n => ({ ...n, achievementAlerts: v }))}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Email Notifications</p>
                      <p className="text-xs text-muted-foreground">Receive updates via email</p>
                    </div>
                    <Switch
                      checked={notifications.emailNotifications}
                      onCheckedChange={(v) => setNotifications(n => ({ ...n, emailNotifications: v }))}
                    />
                  </div>
                </div>
                <div className="pt-2">
                  <Button onClick={handleSaveNotifications} className="gap-2">
                    <Save className="w-4 h-4" />
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Appearance</CardTitle>
                <CardDescription>
                  Customize how Solo Leveling looks and feels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Theme</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {themeOptions.map(({ value, icon: Icon, label }) => (
                      <button
                        key={value}
                        onClick={() => setTheme(value)}
                        className={`p-4 rounded-lg border-2 transition-colors flex flex-col items-center gap-2 ${
                          mounted && theme === value
                            ? 'border-accent bg-accent/10'
                            : 'border-border hover:border-accent/50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Compact Mode</p>
                    <p className="text-xs text-muted-foreground">Use smaller spacing and fonts</p>
                  </div>
                  <Switch
                    checked={appearance.compactMode}
                    onCheckedChange={(v) => setAppearance(a => ({ ...a, compactMode: v }))}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Data Tab */}
        <TabsContent value="data">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Export Data</CardTitle>
                <CardDescription>
                  Download all your habits and progress data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleExportData} variant="outline" className="gap-2">
                  <Database className="w-4 h-4" />
                  Export All Data (JSON)
                </Button>
              </CardContent>
            </Card>

            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible actions that affect your data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleClearData} variant="destructive" className="gap-2">
                  <Database className="w-4 h-4" />
                  Clear All Data
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
