import { Lightbulb, Bug, Rocket, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import FeedbackModal from './FeedBackModal'
const SupportSection = () => {
  const cards = [
    {
      title: 'Feature request',
      description:
        'Have an idea that would make BKLY even better? Tell us what you would love to see.',
      icon: Lightbulb,
      button: 'Suggest a feature',
      color: 'bg-amber-50 text-amber-600',
      category: 'Feature Request' as const,
    },
    {
      title: 'Report an issue',
      description:
        'Found a bug or something not working as expected? Let us know and we will investigate it.',
      icon: Bug,
      button: 'Report an issue',
      color: 'bg-red-50 text-red-600',
      category: 'Bug Report' as const,
    },
    {
      title: 'Website upgrade',
      description:
        'Need a branded website, custom integrations or advanced features? Send us your requirements.',
      icon: Rocket,
      button: 'Request a quote',
      color: 'bg-blue-50 text-blue-600',
      category: 'Improvement' as const,
    },
  ]

  const [open, setOpen] = useState(false)

  const [category, setCategory] = useState<
    | 'Bug Report'
    | 'Feature Request'
    | 'Improvement'
    | 'Question'
    | 'General Feedback'
  >('General Feedback')

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl">
          <span className="text-sm font-medium text-blue-600">
            Support & Feedback
          </span>

          <h2
            style={{
              fontFamily: "'Google Sans Flex', sans-serif",
              fontWeight: 750,
            }}
            className="mt-2 text-4xl tracking-tight text-zinc-900"
          >
            Help us make BKLY even better.
          </h2>

          <p className="mt-4 text-base text-zinc-600">
            Have feedback, found a bug, or looking for a custom website? We'd
            love to hear from you.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon

            return (
              <div
                key={card.title}
                className="rounded-2xl border border-zinc-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.color}`}
                >
                  <Icon size={22} />
                </div>

                <h3 className="mt-6 text-xl font-semibold text-zinc-900">
                  {card.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-zinc-600">
                  {card.description}
                </p>

                <button
                  onClick={() => {
                    setCategory(card.category)
                    setOpen(true)
                  }}
                  className="mt-8 flex items-center gap-2 text-sm font-medium text-blue-600 transition hover:gap-3"
                >
                  {card.button}
                  <ArrowRight size={16} />
                </button>
              </div>
            )
          })}
        </div>
      </div>
      <FeedbackModal
        open={open}
        onClose={() => setOpen(false)}
        category={category}
      />
    </section>
  )
}

export default SupportSection
