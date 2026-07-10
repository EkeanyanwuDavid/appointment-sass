import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400)
    }

    window.addEventListener('scroll', handleScroll)

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  if (!visible) return null

  return (
    <button
      onClick={scrollToTop}
      className="group fixed bottom-6 right-6 z-50 flex h-12 w-12 hover:w-16 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-white shadow-lg transition-all duration-300 hover:bg-blue-700"
      aria-label="Scroll to top"
    >
      <ArrowUp
        size={20}
        className="transition-transform duration-300 group-hover:-translate-y-0.5"
      />
    </button>
  )
}

export default ScrollToTopButton
