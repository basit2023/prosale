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
import { Button } from '@/components/ui/button'; // Import your button component

import { PiPrinter } from "react-icons/pi";

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

export default function FloorPlanMap({ id, slug }: any) {
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
          setFloorData({ ...resData, image: null }); // Set image to null if not available
          toast.error('Floor map image not uploaded yet');
        }
      } catch (error) {
        console.error('Error fetching floor data:', error);
        toast.error('Failed to load floor data');
      }
    };
    if (session) fetchData();
  }, [session, id, slug]);

  useEffect(() => {
    const loadShapes = async () => {
      try {
        const res = await apiService.get(`/shapes?floorId=${floorData?.floorId}`);
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

  const handlePrint = () => {
    if (!stageRef.current) return;
    
    // Create a temporary window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    // Get the stage as an image
    const dataURL = stageRef.current.toDataURL({
      mimeType: 'image/png',
      quality: 1,
    });
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Floor Plan Print</title>
          <style>
            body { margin: 0; padding: 0; }
            img { max-width: 100%; height: auto; display: block; }
            @page { size: auto; margin: 0mm; }
          </style>
        </head>
        <body>
          <img src="${dataURL}" />
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 200);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="@container px-4">
      {floorData && (
        <div className="w-full mx-auto mt-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{floorData.name || 'Floor Plan'}</h2>
            {floorData.image && (
              <Button onClick={handlePrint} className="gap-2">
                <PiPrinter className="w-4 h-4" />
                Print Floor Plan
              </Button>
            )}
          </div>
          
          {!floorData.image ? (
            <div className="p-8 text-center border rounded-lg bg-gray-50">
              <p className="text-lg text-gray-600">Floor map image not uploaded yet</p>
              <p className="text-sm text-gray-500">Please upload a floor plan image to view the map</p>
            </div>
          ) : (
            <div className="relative w-full overflow-auto border rounded shadow">
              {imageStatus === 'loaded' ? (
                <Stage
                  width={image?.width || 800}
                  height={image?.height || 600}
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
          )}
        </div>
      )}
    </div>
  );
}