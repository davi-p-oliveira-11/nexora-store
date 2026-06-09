import { Show, SignInButton, SignUpButton, useAuth, UserButton } from '@clerk/react'
import PageLoader from './components/PageLoader';
import Layout from './components/Layout';

function App() {
  const { isLoaded } = useAuth();

  if (!isLoaded) return <PageLoader />

  return (
    <Layout>
      <header>
        <Show when="signed-out">
          <SignInButton mode="modal" />
          <SignUpButton mode="modal" />
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </header>

      <p className='text-red-500 font-extrabold text-4xl bg-blue-500'>Hello</p>
      <button className="btn btn-primary">Click Me</button>
    </Layout>
  )
}

export default App
