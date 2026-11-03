import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import Button from '../../components/ui/Button';
import GamesEventSection from '../../components/games/GamesEventSection';

const GamesEventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isSupervisor = user?.role === 'supervisor';

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          icon={ArrowLeft}
          onClick={() => navigate('/games/events')}
        >
          Kembali ke Daftar Games
        </Button>
      </div>

      <GamesEventSection
        gameEventId={id}
        isSupervisor={isSupervisor}
      />
    </div>
  );
};

export default GamesEventDetailPage;
