"use client";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Loading...</h2>
        <p className="text-gray-500">
          Please wait while we verify your authentication.
        </p>
      </div>
    </div>
  );

  // This will not be shown as we redirect in useEffect
  return null;
}
