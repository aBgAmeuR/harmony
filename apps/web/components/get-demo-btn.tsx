"use client";

import { signIn } from "@repo/auth/actions";
import { Button } from "@repo/ui/button";

export const GetDemoBtn = () => {
  const onClick = async () => {
    await signIn("credentials", {
      username: "demo",
      password: "demo",
      redirect: true,
      redirectTo: "/settings/about",
    });
  };

  return (
    <Button onClick={onClick} variant="link" className="p-0 text-spotifygreen">
      Get a demo of Harmony
    </Button>
  );
};
