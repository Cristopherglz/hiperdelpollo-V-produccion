import { useState, useEffect } from 'react';
import { useStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Trophy, Calendar, MapPin, Clock, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import type { Partido, FaseMundial } from '@/types';

interface PartidosMundialScreenProps {
  onBack: () => void;
  onSelectPartido: (partido: Partido) => void;
}

const fasesOrden: FaseMundial[] = ['fase-grupos', 'octavos', 'cuartos', 'semifinales', 'tercer-puesto', 'final'];

const fasesLabels: Record<FaseMundial, string> = {
  'fase-grupos': 'Fase de Grupos',
  'octavos': 'Octavos de Final',
  'cuartos': 'Cuartos de Final',
  'semifinales': 'Semifinales',
  'tercer-puesto': 'Tercer Puesto',
  'final': 'Gran Final'
};

const grupos = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export function PartidosMundialScreen({ onBack, onSelectPartido }: PartidosMundialScreenProps) {
  const { partidos, user, verificarPrediccion } = useStore();
  const [faseActiva, setFaseActiva] = useState<FaseMundial>('fase-grupos');
  const [grupoActivo, setGrupoActivo] = useState<string>('A');
  const [misPredicciones, setMisPredicciones] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Cargar mis predicciones
    const misPreds = new Set<string>();
    partidos.forEach(partido => {
      const prediccion = verificarPrediccion(partido.id);
      if (prediccion) {
        misPreds.add(partido.id);
      }
    });
    setMisPredicciones(misPreds);
  }, [partidos, verificarPrediccion]);

  const getPartidosPorFase = (fase: FaseMundial) => {
    return partidos.filter(p => p.fase === fase);
  };

  const getPartidosPorGrupo = (grupo: string) => {
    return partidos.filter(p => p.fase === 'fase-grupos' && p.grupo === grupo);
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'programado':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Programado</Badge>;
      case 'en-vivo':
        return <Badge className="bg-green-500 text-white animate-pulse">En Vivo</Badge>;
      case 'finalizado':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-700">Finalizado</Badge>;
      case 'cancelado':
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return null;
    }
  };

  const formatFecha = (fecha: string, hora: string) => {
    const date = new Date(`${fecha}T${hora}`);
    return date.toLocaleDateString('es-AR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    }) + ` - ${hora}`;
  };

  const renderPartidoCard = (partido: Partido) => {
    const yaPredije = misPredicciones.has(partido.id);
    const puedePredecir = partido.estado === 'programado' && !yaPredije;

    return (
      <Card 
        key={partido.id} 
        className={`mb-3 overflow-hidden transition-all duration-200 ${
          puedePredecir 
            ? 'cursor-pointer hover:shadow-lg hover:border-pollo-amarillo' 
            : yaPredije 
              ? 'border-green-300 bg-green-50/30' 
              : 'opacity-75'
        }`}
        onClick={() => puedePredecir && onSelectPartido(partido)}
      >
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>{formatFecha(partido.fecha, partido.hora)}</span>
            </div>
            {getEstadoBadge(partido.estado)}
          </div>

          {/* Equipos */}
          <div className="flex items-center justify-between mb-3">
            {/* Local */}
            <div className="flex flex-col items-center flex-1">
              <img 
                src={partido.equipoLocal.bandera} 
                alt={partido.equipoLocal.nombre}
                className="w-12 h-8 object-cover rounded shadow-sm mb-2"
              />
              <span className="text-sm font-bold text-center">{partido.equipoLocal.codigo}</span>
              <span className="text-xs text-gray-500 text-center truncate w-full">{partido.equipoLocal.nombre}</span>
            </div>

            {/* VS / Resultado */}
            <div className="flex flex-col items-center px-4">
              {partido.estado === 'finalizado' && partido.golesLocal !== undefined ? (
                <div className="text-2xl font-black text-pollo-marron">
                  {partido.golesLocal} - {partido.golesVisitante}
                </div>
              ) : (
                <div className="text-xl font-black text-gray-400">VS</div>
              )}
              {partido.grupo && (
                <Badge variant="outline" className="mt-1 text-xs">
                  Grupo {partido.grupo}
                </Badge>
              )}
            </div>

            {/* Visitante */}
            <div className="flex flex-col items-center flex-1">
              <img 
                src={partido.equipoVisitante.bandera} 
                alt={partido.equipoVisitante.nombre}
                className="w-12 h-8 object-cover rounded shadow-sm mb-2"
              />
              <span className="text-sm font-bold text-center">{partido.equipoVisitante.codigo}</span>
              <span className="text-xs text-gray-500 text-center truncate w-full">{partido.equipoVisitante.nombre}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="w-3 h-3" />
              <span className="truncate max-w-[120px]">{partido.estadio}</span>
            </div>
            
            {yaPredije ? (
              <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>Ya pronosticaste</span>
              </div>
            ) : partido.estado === 'programado' ? (
              <Button size="sm" className="bg-pollo-amarillo hover:bg-pollo-amarillo text-pollo-marron text-xs">
                Predecir
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-pollo-amarillo">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-pollo-amarillo/20 px-4 py-3">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-black text-pollo-marron flex items-center gap-2">
              <Trophy className="w-5 h-5 text-pollo-amarillo" />
              Mundial 2026
            </h1>
            <p className="text-xs text-gray-500">Predicciones con Triple Chance</p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mx-4 mt-4 p-4 bg-pollo-amarillo rounded-xl">
        <div className="flex items-start gap-3">
          <div className="bg-pollo-fondo-claro/30 p-2 rounded-lg">
            <TrendingUp className="w-6 h-6 text-pollo-marron" />
          </div>
          <div>
            <h3 className="font-bold text-pollo-marron text-sm">¿Cómo funciona?</h3>
            <p className="text-xs text-pollo-marron mt-1">
              1. Predecí el resultado de cada partido<br/>
              2. Participás automáticamente del sorteo<br/>
              3. Si acertás, tenés <strong>TRIPLE CHANCE</strong> de ganar
            </p>
          </div>
        </div>
      </div>

      {/* Tabs de Fases */}
      <div className="px-4 mt-4">
        <Tabs value={faseActiva} onValueChange={(v) => setFaseActiva(v as FaseMundial)}>
          <TabsList className="w-full grid grid-cols-3 h-auto gap-1 bg-white/50 p-1">
            {fasesOrden.slice(0, 3).map(fase => (
              <TabsTrigger 
                key={fase} 
                value={fase}
                className="text-xs py-2 data-[state=active]:bg-pollo-amarillo data-[state=active]:text-pollo-marron"
              >
                {fase === 'fase-grupos' ? 'Grupos' : fase === 'octavos' ? 'Octavos' : 'Cuartos'}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsList className="w-full grid grid-cols-3 h-auto gap-1 bg-white/50 p-1 mt-1">
            {fasesOrden.slice(3).map(fase => (
              <TabsTrigger 
                key={fase} 
                value={fase}
                className="text-xs py-2 data-[state=active]:bg-pollo-amarillo data-[state=active]:text-pollo-marron"
              >
                {fase === 'semifinales' ? 'Semi' : fase === 'tercer-puesto' ? '3° Puesto' : 'Final'}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Fase de Grupos - Tabs de Grupos */}
          <TabsContent value="fase-grupos" className="mt-4">
            <div className="flex gap-1 overflow-x-auto pb-2 mb-2 scrollbar-hide">
              {grupos.map(grupo => (
                <button
                  key={grupo}
                  onClick={() => setGrupoActivo(grupo)}
                  className={`min-w-[40px] h-10 rounded-lg font-bold text-sm transition-all ${
                    grupoActivo === grupo
                      ? 'bg-pollo-amarillo text-pollo-marron'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {grupo}
                </button>
              ))}
            </div>
            
            <div className="space-y-1">
              {getPartidosPorGrupo(grupoActivo).length > 0 ? (
                getPartidosPorGrupo(grupoActivo).map(renderPartidoCard)
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No hay partidos programados para el Grupo {grupoActivo}</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Otras fases */}
          {fasesOrden.slice(1).map(fase => (
            <TabsContent key={fase} value={fase} className="mt-4">
              <div className="space-y-1">
                {getPartidosPorFase(fase).length > 0 ? (
                  getPartidosPorFase(fase).map(renderPartidoCard)
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Los partidos de {fasesLabels[fase]} se definirán próximamente</p>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Mis Predicciones Summary */}
      {misPredicciones.size > 0 && (
        <div className="mx-4 mt-4 mb-6 p-4 bg-white rounded-xl shadow-sm border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Tus predicciones</p>
              <p className="text-2xl font-black text-green-600">{misPredicciones.size}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            ¡Seguí pronosticando para aumentar tus chances!
          </p>
        </div>
      )}
    </div>
  );
}
