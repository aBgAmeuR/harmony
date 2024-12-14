import { signOut } from "@repo/auth/actions";
import { Button } from "@repo/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import { cn } from "@repo/ui/lib/utils";
import { useSidebar } from "@repo/ui/sidebar";

export function SidebarOptInForm() {
  const { open } = useSidebar();

  return (
    <Card className={cn("p-2 overflow-hidden", !open && "hidden")}>
      <CardHeader className="p-2">
        <CardTitle className="text-sm break-all line-clamp-2">
          You are in a demo
        </CardTitle>
        <CardDescription className="text-xs break-all line-clamp-2">
          You need to log in to see your own data
        </CardDescription>
      </CardHeader>
      <CardContent className="p-2">
        <form
          action={async () => {
            await signOut({
              redirect: true,
              redirectTo: "/",
            });
          }}
        >
          <Button className="w-full" size="sm" type="submit">
            Exit demo
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
