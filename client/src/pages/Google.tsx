import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderOpen, RefreshCw, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Google() {
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleGoogleSignIn = () => {
    // Google OAuth flow will be implemented
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsAuthenticated(true);
    }, 1000);
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Google Drive</h1>
          <p className="text-muted-foreground mt-2">
            Access your Google Drive files and folders through OAuth SSO.
          </p>
        </div>
        {isAuthenticated && (
          <Button
            onClick={handleRefresh}
            disabled={loading}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        )}
      </div>

      {!isAuthenticated ? (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Authentication Required
            </CardTitle>
            <CardDescription>Sign in with your Google account to access Drive files</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Click the button below to authorize Command Center to access your Google Drive.
              </p>
              <Button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full gap-2"
              >
                {loading ? "Signing in..." : "Sign in with Google"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-primary" />
                My Files
              </CardTitle>
              <CardDescription>Your Google Drive files and folders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground text-center py-12">
                Loading files... (API integration in progress)
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
