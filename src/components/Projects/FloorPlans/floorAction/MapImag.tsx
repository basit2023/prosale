'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { Controller, useForm } from 'react-hook-form';
import { Stage, Layer, Image as KonvaImage, Line, Circle } from 'react-konva';
import Spinner from '@/components/ui/spinner';
import FormGroup from '@/app/shared/form-group';
import apiService from '@/utils/apiService';
import axios from 'axios';
import useImage from 'use-image';
import { NewFloorFormTypes, defaultValues } from '@/utils/validators/new-floor.schema';
import dynamic from 'next/dynamic';

const SelectBox = dynamic(() => import('@/components/ui/select'), {
  ssr: false,
  loading: () => <div className="grid h-10 place-content-center"><Spinner /></div>,
});

interface UnitShape {
  id?: string;
  type: string;
  points: number[];
  stroke: string;
  strokeWidth: number;
  fill: string;
  closed: boolean;
  draggable: boolean;
  unitId?: string;
}

export default function MapImag({ id, slug }: any) {
  const { data: session } = useSession();
  const [floorData, setFloorData] = useState<any>(null);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [shapes, setShapes] = useState<UnitShape[]>([]);
  const [currentPoints, setCurrentPoints] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [message, setMessage] = useState('Select a unit from dropdown to start drawing');
  const [fillColor, setFillColor] = useState('rgba(255, 0, 0, 0.5)');
  const [image, imageStatus] = useImage(floorData?.image || '');
  const stageRef = useRef<any>(null);
  const [isClient, setIsClient] = useState(false);

  const { control } = useForm<NewFloorFormTypes>({ defaultValues, mode: 'onChange' });

  useEffect(() => { setIsClient(true); }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiService.get(`/floors-map-data/?slug=${slug}&&id=${id}`);
        const resData = response.data?.data;
        if (resData?.image?.data && Array.isArray(resData.image.data)) {
          const buffer = Buffer.from(resData.image.data);
          const imageDataUrl = buffer.toString('utf8');
          setFloorData({ ...resData, image: imageDataUrl });
        } else if (typeof resData?.image === 'string') {
          setFloorData({ ...resData, image: resData.image.startsWith('data:image') ? resData.image : `data:image/jpeg;base64,${resData.image}` });
        } else {
          toast.error('Unsupported image format from server');
        }
      } catch (error) {
        console.error('Error fetching floor data:', error);
        toast.error('Failed to load floor data');
      }
    };
    if (session) fetchData();
  }, [session, id, slug]);

  useEffect(() => {
    // if (!selectedUnit || !isClient) return;
    const loadShapes = async () => {
      try {
        const res = await apiService.get(`/shapes?floorId=${floorData?.floorId}`);
        console.log("the value that i'm getting is:",res)
        setShapes(res.data.map((shape: any) => ({
          id: shape.id,
          type: shape.shapeType,
          points: shape.coordinates,
          stroke: shape.properties.stroke || '#0000ff',
          strokeWidth: shape.properties.strokeWidth || 2,
          fill: shape.properties.fill || 'rgba(0, 0, 255, 0.5)',
          closed: true,
          draggable: false,
          unitId: selectedUnit,
        })));
      } catch (err) {
        console.error('Error loading shapes:', err);
      }
    };
    loadShapes();
  }, [selectedUnit, floorData?.floorId, isClient]);

  const startDrawing = () => {
    if (!selectedUnit) return setMessage('Please select a unit first');
    setCurrentPoints([]);
    setIsDrawing(true);
    setMessage('Click on the image to place points. Click near first point to complete.');
  };

  const handleCanvasClick = (e: any) => {
    if (!isDrawing || !selectedUnit || !stageRef.current) return;
    const stage = stageRef.current;
    const pointer = stage.getPointerPosition();
    const newPoint = [pointer.x, pointer.y];
    if (currentPoints.length >= 4) {
      const [x0, y0] = currentPoints;
      const dist = Math.hypot(newPoint[0] - x0, newPoint[1] - y0);
      if (dist < 15) return completePolygon();
    }
    setCurrentPoints([...currentPoints, ...newPoint]);
  };

  const completePolygon = async () => {
    if (currentPoints.length < 6 || !floorData || !selectedUnit) return;
    const newShape: UnitShape = {
      type: 'polygon', points: [...currentPoints], stroke: '#ff0000', strokeWidth: 2,
      fill: fillColor, closed: true, draggable: false, unitId: selectedUnit
    };
    try {
      const res = await apiService.post('/shapes', {
        floorId: floorData.floorId, unitId: selectedUnit,
        shapeType: 'polygon', coordinates: newShape.points,
        properties: { stroke: newShape.stroke, fill: newShape.fill, strokeWidth: newShape.strokeWidth }
      });
      setShapes([...shapes, { ...newShape, id: res.data.id }]);
      setMessage(`Shape saved for unit ${selectedUnit}`);
    } catch (err: any) {
      setMessage('Error saving shape: ' + err.message);
    }
    setIsDrawing(false);
    setCurrentPoints([]);
  };

  return (
    <div className="@container px-4">
      <FormGroup title="Floor Map" description="Draw sections for each unit on the floor plan" />
      <FormGroup title="Select Unit">
        <Controller
          control={control}
          name="unit_id"
          render={({ field: { onChange } }) => (
            <SelectBox
              placeholder="Select Unit"
              options={floorData?.units?.map(u => ({ value: u.id, label: u.Label })) || []}
              onChange={(val) => {
                onChange(val);
                setSelectedUnit(val);
                setMessage(`Selected unit: ${val}`);
              }}
              value={selectedUnit}
            />
          )}
        />
      </FormGroup>

      {floorData?.image && isClient && (
        <div className="w-full mx-auto mt-4">
          <div className="mb-3 text-sm text-gray-700 font-medium">{message}</div>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <button className="px-4 py-1 bg-blue-600 text-white rounded disabled:opacity-50" onClick={startDrawing} disabled={!selectedUnit || isDrawing}>Start Drawing</button>
            <button className="px-4 py-1 bg-gray-500 text-white rounded disabled:opacity-50" onClick={() => setIsDrawing(false)} disabled={!isDrawing}>Cancel</button>
            <button className="px-4 py-1 bg-green-600 text-white rounded disabled:opacity-50" onClick={completePolygon} disabled={!isDrawing || currentPoints.length < 6}>Save Shape</button>
          </div>

          <div className="relative w-full overflow-auto border rounded shadow">
            {imageStatus === 'loaded' ? (
              <Stage
                width={image?.width || 800}
                height={image?.height || 600}
                onClick={handleCanvasClick}
                ref={stageRef}
              >
                <Layer>
                  <KonvaImage image={image} />
                  {shapes.map(s => (
                    <Line
                      key={s.id}
                      points={s.points}
                      stroke={s.stroke}
                      strokeWidth={s.strokeWidth}
                      fill={s.fill}
                      closed={s.closed}
                      draggable={s.draggable}
                    />
                  ))}
                  {isDrawing && currentPoints.length > 1 && (
                    <>
                      <Line
                        points={currentPoints}
                        stroke="green"
                        strokeWidth={2}
                        fill="rgba(0,255,0,0.3)"
                        closed={true}
                      />
                      {currentPoints.map((_, i) =>
                        i % 2 === 0 && (
                          <Circle
                            key={i}
                            x={currentPoints[i]}
                            y={currentPoints[i + 1]}
                            radius={5}
                            fill="green"
                            stroke="white"
                            strokeWidth={1}
                          />
                        )
                      )}
                    </>
                  )}
                </Layer>
              </Stage>
            ) : (
              <div className="p-4 text-center text-gray-500">Loading image...</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}