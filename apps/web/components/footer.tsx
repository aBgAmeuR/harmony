import { Button } from "@repo/ui/button";

export const Footer = () => {
  return (
    <footer className="my-4">
      <p className="text-center">
        Built by{" "}
        <Button variant="link" className="p-0" asChild>
          <a href="https://github.com/aBgAmeuR">@aBgAmeuR</a>
        </Button>{" "}
        - <span className="text-muted-foreground">v2.1</span>
      </p>
    </footer>
  );
};
