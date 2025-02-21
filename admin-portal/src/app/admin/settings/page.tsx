'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/components/ui/use-toast'

interface Settings {
  allow_new_registrations: boolean
  maintenance_mode: boolean
  default_currency: string
  support_email: string
  terms_url: string
  privacy_url: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    allow_new_registrations: true,
    maintenance_mode: false,
    default_currency: 'TRY',
    support_email: 'support@example.com',
    terms_url: 'https://example.com/terms',
    privacy_url: 'https://example.com/privacy'
  })

  const [isSaving, setIsSaving] = useState(false)

  const { data: currentSettings, isLoading } = useQuery<Settings>({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No settings found, create default settings
          const { data: newSettings, error: createError } = await supabase
            .from('settings')
            .insert([settings])
            .select()
            .single()

          if (createError) throw createError
          return newSettings as Settings
        }
        throw error
      }

      return data as Settings
    },
    initialData: settings
  })

  // Update settings when data changes
  useEffect(() => {
    if (currentSettings) {
      setSettings(currentSettings)
    }
  }, [currentSettings])

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true)
      const { error } = await supabase
        .from('settings')
        .upsert(settings)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Settings saved successfully',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save settings',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Settings</h1>
        <Button
          onClick={handleSaveSettings}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Card className="p-6">
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-semibold">General Settings</h2>
            <p className="text-sm text-muted-foreground">
              Manage your application's general settings
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow New Registrations</Label>
                <p className="text-sm text-muted-foreground">
                  Enable or disable new user registrations
                </p>
              </div>
              <Switch
                checked={settings.allow_new_registrations}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, allow_new_registrations: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Put the application in maintenance mode
                </p>
              </div>
              <Switch
                checked={settings.maintenance_mode}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, maintenance_mode: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Default Currency</Label>
              <Input
                value={settings.default_currency}
                onChange={(e) =>
                  setSettings({ ...settings, default_currency: e.target.value })
                }
              />
            </div>
          </div>

          <Separator />

          <div>
            <h2 className="text-lg font-semibold">Contact Information</h2>
            <p className="text-sm text-muted-foreground">
              Configure support and contact information
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Support Email</Label>
              <Input
                type="email"
                value={settings.support_email}
                onChange={(e) =>
                  setSettings({ ...settings, support_email: e.target.value })
                }
              />
            </div>
          </div>

          <Separator />

          <div>
            <h2 className="text-lg font-semibold">Legal</h2>
            <p className="text-sm text-muted-foreground">
              Manage legal document URLs
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Terms of Service URL</Label>
              <Input
                type="url"
                value={settings.terms_url}
                onChange={(e) =>
                  setSettings({ ...settings, terms_url: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Privacy Policy URL</Label>
              <Input
                type="url"
                value={settings.privacy_url}
                onChange={(e) =>
                  setSettings({ ...settings, privacy_url: e.target.value })
                }
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
} 