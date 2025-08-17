

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        <div className="text-center">
          <p className="text-muted-foreground">Registration coming soon...</p>
          <p className="text-sm mt-2">
            <a href="/login" className="text-primary hover:underline">
              Back to Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}