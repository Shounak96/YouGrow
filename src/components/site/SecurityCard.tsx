import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProButton } from "@/components/ui/pro-button";

export function SecurityCard({ hasPassword }: { hasPassword: boolean }) {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-base">Security</CardTitle>
        <p className="text-sm text-gray-600">Manage how you sign in.</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2">
          <span className="text-sm font-medium">Login method</span>
          {hasPassword ? (
            <Badge variant="secondary">Email + Password</Badge>
          ) : (
            <Badge variant="outline">Google Sign-In</Badge>
          )}
        </div>

        <div className="flex items-center justify-between rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2">
          <span className="text-sm font-medium">Change password</span>
          {hasPassword ? (
            <Link href="/profile/security">
              <ProButton>Open</ProButton>
            </Link>
          ) : (
            <Badge variant="outline">Not available</Badge>
          )}
        </div>

        {!hasPassword && (
          <div className="text-xs text-gray-500">
            You signed in with Google. Password is managed by Google.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
