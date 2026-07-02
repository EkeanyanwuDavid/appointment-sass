import { useAppSelector } from '../../store/hooks'

const Home = () => {
  const { user } = useAppSelector((state) => state.auth)

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10">
      <div className="mx-auto max-w-4xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-4">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="h-14 w-14 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-lg font-semibold text-white">
              {user?.name?.charAt(0) || 'U'}
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-blue-600">Signed in</p>
            <h1 className="text-2xl font-semibold text-zinc-900">
              {user?.name || 'Welcome'}
            </h1>
            <p className="text-sm text-zinc-500">{user?.email}</p>
          </div>
        </div>

        <div className="mt-8 rounded-xl bg-zinc-50 p-6">
          <h2 className="text-lg font-semibold text-zinc-900">Your account</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Google sign-in is working and your profile details are now available
            in the app.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Home
