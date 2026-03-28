import Logo from "@/components/ui/Logo";

export default function Footer() {
  return (
    <footer className="py-12 px-6 bg-foreground text-background/60 text-center text-sm">
      <div className="mb-4">
        <Logo variant="monogram" className="text-background/40" />
      </div>
      <p>&copy; {new Date().getFullYear()} Noobwork. All rights reserved.</p>
      <p className="mt-1">Built in Tokyo</p>
    </footer>
  );
}
