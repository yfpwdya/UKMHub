import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ukmApi } from '../api/ukm';
import { useRegistrationStore } from '../store/registrationStore';
import type { UKM, UKMCategory } from '../types/ukm';
import { UKM_CATEGORIES } from '../types/ukm';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { AthleteModal } from '../components/athlete/AthleteModal';
import { Sparkles, GripVertical, Trash2, ArrowRight, Check, Trophy } from 'lucide-react';

const categoryColor: Record<string, 'indigo' | 'green' | 'yellow' | 'red' | 'purple' | 'blue' | 'gray'> = {
  Olahraga: 'green',
  Seni: 'yellow',
  Teknologi: 'indigo',
  Sosial: 'red',
  Akademik: 'purple',
};

const SortableItem = ({ choice }: { choice: { priority: number; ukm: UKM } }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: choice.ukm.id });
  const { removeUKMChoice } = useRegistrationStore();
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3.5 bg-white border border-slate-200/80 rounded-xl shadow-sm hover:shadow-md transition-shadow"
    >
      <span className="w-7 h-7 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold text-xs shrink-0 shadow-sm shadow-indigo-500/20">
        P{choice.priority}
      </span>
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 shrink-0">
        <GripVertical className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-800 truncate">{choice.ukm.name}</p>
        <p className="text-xs text-slate-400">{choice.ukm.category}</p>
      </div>
      <button
        onClick={() => removeUKMChoice(choice.ukm.id)}
        className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export const SelectUKMPage = () => {
  const navigate = useNavigate();
  const { recommended, selectedUKM, addUKMChoice, reorderChoices } = useRegistrationStore();
  const [allUKM, setAllUKM] = useState<UKM[]>([]);
  const [activeCategory, setActiveCategory] = useState<UKMCategory>('Semua');
  const [loading, setLoading] = useState(true);

  // Athlete Modal State
  const [athleteModalOpen, setAthleteModalOpen] = useState(false);
  const [selectedSportUkm, setSelectedSportUkm] = useState<string>('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    ukmApi.getAll().then((res) => {
      setAllUKM(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIndex = selectedUKM.findIndex((c) => c.ukm.id === active.id);
    const toIndex = selectedUKM.findIndex((c) => c.ukm.id === over.id);
    reorderChoices(fromIndex, toIndex);
  };

  const filtered = activeCategory === 'Semua'
    ? allUKM
    : allUKM.filter((u) => u.category === activeCategory);

  const isSelected = (id: number) => selectedUKM.some((c) => c.ukm.id === id);
  const recommendedIds = new Set(recommended.map((u) => u.id));

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8">
        <Badge color="indigo" icon={<Sparkles className="w-3.5 h-3.5" />}>
          Pemilihan Organisasi
        </Badge>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-2">Pilih Skala Prioritas UKM</h1>
        <p className="text-slate-500 mt-1">
          Pilih maksimal 4 UKM. Atur urutan prioritas dengan menggeser kartu pilihan di panel kanan.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main List */}
        <div className="lg:col-span-2">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            {UKM_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all duration-200 cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((ukm) => {
                const selected = isSelected(ukm.id);
                const isRec = recommendedIds.has(ukm.id);
                const isSport = ukm.category.toLowerCase() === 'olahraga';
                const choiceIndex = selectedUKM.findIndex((c) => c.ukm.id === ukm.id);

                return (
                  <Card
                    key={ukm.id}
                    className={`relative p-5 transition-all duration-200 ${
                      selected
                        ? 'border-2 border-indigo-600 bg-indigo-50/30 shadow-md'
                        : 'hover:border-indigo-200'
                    } ${!selected && selectedUKM.length >= 4 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => {
                      if (selected || selectedUKM.length < 4) addUKMChoice(ukm);
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <Badge color={categoryColor[ukm.category] || 'gray'}>{ukm.category}</Badge>
                      {isRec && (
                        <span className="text-[10px] uppercase font-extrabold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                          Rekomendasi
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-800 text-base mb-1.5 flex items-center justify-between">
                      {ukm.name}
                      {selected && (
                        <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </h3>

                    <p className="text-xs text-slate-500 leading-relaxed mb-4">{ukm.description}</p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      {selected ? (
                        <span className="text-xs font-semibold text-indigo-600">
                          Prioritas #{choiceIndex + 1}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Klik untuk memilih</span>
                      )}

                      {/* Tombol Jalur Atlet */}
                      {isSport && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSportUkm(ukm.name);
                            setAthleteModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trophy className="w-3 h-3" /> Jalur Atlet
                        </button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Priority Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 border-indigo-100 shadow-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-slate-800">Prioritas Pilihan</h2>
              <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                {selectedUKM.length} / 4 UKM
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-6">Drag ikon pegangan untuk mengatur urutan prioritas</p>

            {selectedUKM.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl">
                <p className="text-xs text-slate-400 font-medium">
                  Belum ada UKM dipilih.<br />Klik kartu di sebelah kiri.
                </p>
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={selectedUKM.map((c) => c.ukm.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3 mb-6">
                    {selectedUKM.map((choice) => (
                      <SortableItem key={choice.ukm.id} choice={choice} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            <Button
              className="w-full shadow-lg"
              size="lg"
              disabled={selectedUKM.length === 0}
              onClick={() => navigate('/confirm')}
            >
              Lanjut Konfirmasi <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Card>
        </div>
      </div>

      {/* Modal Portofolio Atlet */}
      <AthleteModal
        isOpen={athleteModalOpen}
        onClose={() => setAthleteModalOpen(false)}
        sportCategory={selectedSportUkm}
      />
    </div>
  );
};
