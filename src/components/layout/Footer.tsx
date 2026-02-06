export default function Footer() {
  return (
    <footer className="py-8 px-6 bg-foreground text-white/60 text-center text-sm">
      <p>&copy; {new Date().getFullYear()} Joachim Haraldsen. Built with ☕ in Tokyo.</p>
      <p className="mt-2">🇳🇴 🇯🇵</p>
    </footer>
  );
}
