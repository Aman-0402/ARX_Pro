export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-gray-200 dark:border-gray-700 border-t-gold-400 animate-spin" />
        <p className="text-gray-400 font-poppins text-sm tracking-wide">
          Loading...
        </p>
      </div>
    </div>
  );
}
