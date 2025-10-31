'use client';

export default function Register() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-2">ChatApp</h1>
        <p className="text-gray-600 mb-6">Opprett en ny konto</p>

        <form action="/register" method="post" className="space-y-4">
          <section>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-post</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </section>
          <section>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Passord</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </section>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
          >
            Registrer
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          Har du allerede konto?{' '}
          <a href="/login" className="text-blue-600 hover:underline">Logg inn</a>
        </div>
      </div>
    </div>
  );
}