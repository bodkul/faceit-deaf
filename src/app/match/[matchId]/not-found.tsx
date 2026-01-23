export default function notFound() {
  return (
    <div className="flex h-96 flex-col items-center justify-center text-center">
      <h2 className="font-bold text-2xl">Match not found</h2>
      <p className="text-muted-foreground">
        Sorry, this match doesn't exist 😔
      </p>
    </div>
  );
}
