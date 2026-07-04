import { useNavigate } from 'react-router-dom'
import BusinessLayout from '../../components/layout/BusinessLayout'
import CreateBusinessForm from '../../components/ui/CreateBusinessForm'

const CreateBusiness = () => {
  const navigate = useNavigate()

  return (
    <BusinessLayout>
      <div className="min-h-screen bg-zinc-50 px-4 py-10">
        <div className="mx-auto max-w-4xl">
          <CreateBusinessForm
            onSuccess={() => navigate('/business/dashboard')}
          />
        </div>
      </div>
    </BusinessLayout>
  )
}

export default CreateBusiness
