import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useStore } from '@/lib/store'
import { User, Bell, Bot, Palette, Database, Save, Moon, Sun } from 'lucide-react'
import toast from 'react-hot-toast'

const AI_MODELS = [
  { value: 'anthropic/claude-sonnet-4', label: 'Claude Sonnet 4' },
  { value: 'openai/gpt-4.1', label: 'GPT-4.1' },
  { value: 'google/gemini-pro-latest', label: 'Gemini Pro' },
  { value: 'openai/gpt-4.1-mini', label: 'GPT-4.1 Mini' },
  { value: 'google/gemini-flash-latest', label: 'Gemini Flash' },
]

export default function Settings() {
  const { darkMode, toggleDarkMode, selectedModel, setSelectedModel } = useStore()
  const [profile, setProfile] = useState({
    fullName: 'Demo Farmer',
    email: 'farmer@ovigrow.app',
    farmName: 'Green Valley Farm',
    location: 'Harare, Zimbabwe',
    farmSize: '25',
    primaryCrops: 'Maize, Wheat, Soybeans',
    bio: 'Commercial farmer in Mashonaland East, focusing on crop and livestock production.',
  })
  const [notifications, setNotifications] = useState({
    weatherAlerts: true,
    pestAlerts: true,
    marketPrices: true,
    communityUpdates: false,
    weeklyReport: true,
  })

  const handleSaveProfile = () => {
    toast.success('Profile saved successfully!')
  }

  const handleSaveNotifications = () => {
    toast.success('Notification preferences saved!')
  }

  const handleSaveAI = () => {
    toast.success('AI settings saved!')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="flex w-full overflow-x-auto h-auto flex-nowrap scrollbar-thin">
          <TabsTrigger value="profile" className="text-xs sm:text-sm"><User className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" /><span className="hidden sm:inline">Profile</span><span className="sm:hidden">Profile</span></TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs sm:text-sm"><Bell className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" /><span className="hidden sm:inline">Notifications</span><span className="sm:hidden">Alerts</span></TabsTrigger>
          <TabsTrigger value="ai" className="text-xs sm:text-sm"><Bot className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" /><span className="hidden sm:inline">AI Settings</span><span className="sm:hidden">AI</span></TabsTrigger>
          <TabsTrigger value="appearance" className="text-xs sm:text-sm"><Palette className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" /><span className="hidden sm:inline">Appearance</span><span className="sm:hidden">Theme</span></TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader><CardTitle>Farm Profile</CardTitle><CardDescription>Update your personal and farm information</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2"><label className="text-sm font-medium">Full Name</label><Input value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} /></div>
                <div className="space-y-2"><label className="text-sm font-medium">Email</label><Input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2"><label className="text-sm font-medium">Farm Name</label><Input value={profile.farmName} onChange={(e) => setProfile({ ...profile, farmName: e.target.value })} /></div>
                <div className="space-y-2"><label className="text-sm font-medium">Location</label><Input value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2"><label className="text-sm font-medium">Farm Size (hectares)</label><Input type="number" value={profile.farmSize} onChange={(e) => setProfile({ ...profile, farmSize: e.target.value })} /></div>
                <div className="space-y-2"><label className="text-sm font-medium">Primary Crops</label><Input value={profile.primaryCrops} onChange={(e) => setProfile({ ...profile, primaryCrops: e.target.value })} /></div>
              </div>
              <div className="space-y-2"><label className="text-sm font-medium">Bio</label><Textarea value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} /></div>
              <Button onClick={handleSaveProfile}><Save className="mr-2 h-4 w-4" />Save Profile</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader><CardTitle>Notification Preferences</CardTitle><CardDescription>Choose what alerts you receive</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</p>
                    <p className="text-sm text-muted-foreground">
                      {key === 'weatherAlerts' && 'Get notified about severe weather conditions'}
                      {key === 'pestAlerts' && 'Receive alerts about pest outbreaks in your area'}
                      {key === 'marketPrices' && 'Daily updates on crop prices'}
                      {key === 'communityUpdates' && 'New posts and replies in community forums'}
                      {key === 'weeklyReport' && 'Weekly farm performance summary'}
                    </p>
                  </div>
                  <Button variant={value ? 'default' : 'outline'} size="sm" onClick={() => setNotifications({ ...notifications, [key]: !value })}>
                    {value ? 'On' : 'Off'}
                  </Button>
                </div>
              ))}
              <Button onClick={handleSaveNotifications}><Save className="mr-2 h-4 w-4" />Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardHeader><CardTitle>AI Assistant Settings</CardTitle><CardDescription>Configure your AI model and preferences</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Default AI Model</label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {AI_MODELS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Choose the AI model for your farming assistant</p>
              </div>
              <div className="rounded-lg border p-4 bg-muted/50">
                <h4 className="font-medium mb-2">AI Capabilities</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Crop management advice and recommendations</li>
                  <li>• Pest and disease identification</li>
                  <li>• Weather-based farming decisions</li>
                  <li>• Market price analysis and timing</li>
                  <li>• Soil health interpretation</li>
                  <li>• Livestock management guidance</li>
                </ul>
              </div>
              <Button onClick={handleSaveAI}><Save className="mr-2 h-4 w-4" />Save AI Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader><CardTitle>Appearance</CardTitle><CardDescription>Customize the look and feel of OviGrow</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  <div>
                    <p className="font-medium">Dark Mode</p>
                    <p className="text-sm text-muted-foreground">{darkMode ? 'Dark theme enabled' : 'Light theme enabled'}</p>
                  </div>
                </div>
                <Button variant="outline" onClick={toggleDarkMode}>{darkMode ? 'Switch to Light' : 'Switch to Dark'}</Button>
              </div>
              <div className="rounded-lg border p-4">
                <p className="font-medium mb-2">Theme Colors</p>
                <div className="flex gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary cursor-pointer ring-2 ring-primary ring-offset-2" />
                  <div className="h-8 w-8 rounded-full bg-blue-600 cursor-pointer" />
                  <div className="h-8 w-8 rounded-full bg-purple-600 cursor-pointer" />
                  <div className="h-8 w-8 rounded-full bg-orange-600 cursor-pointer" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Theme customization coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
