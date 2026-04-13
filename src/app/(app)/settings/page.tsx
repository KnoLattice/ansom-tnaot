"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useAuthStore } from "@/store/auth.store";

export default function SettingsPage() {
  const learner = useAuthStore((state) => state.learner);
  const form = useForm({
    defaultValues: {
      fullName: learner?.fullName ?? "",
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile, storage, and account preferences.
        </p>
      </div>
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update your display name.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Full name</Label>
                <Input {...form.register("fullName")} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={learner?.email ?? ""} disabled />
                <p className="text-xs text-muted-foreground">
                  Email changes are not supported yet.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button disabled>Save changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="storage">
          <Card>
            <CardHeader>
              <CardTitle>Storage</CardTitle>
              <CardDescription>6.2 MB of 50 MB used</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={32} className="h-2" />
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Documents: 4</p>
                <p>Next quota reset: 30 days</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline">View documents</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Danger zone</CardTitle>
              <CardDescription>Delete your account permanently.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                This action cannot be undone and will remove all documents,
                graphs, and session data.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="destructive" disabled>
                Deactivate account
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
