import React, { createContext, useState, ReactNode } from 'react';

export interface Property {
  id: string;
  address: string;
  sector: string;
  size: string;
  price: string;
  notes: string;
  facing: string;
  contact: string;
  tags?: string[];
}

interface PropertyContextType {
  properties: Property[];
  addProperty: (property: Omit<Property, 'id'>) => void;
  deleteProperty: (id: string) => void;
  updateProperty: (property: Property) => void;
}

export const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

const initialProperties: Property[] = [
  { id: '1', address: 'A-12, VASANT VIHAR', sector: 'SOUTH DELHI', size: '450', price: '150000000', notes: 'PREMIUM BUNGALOW, OLD CONSTRUCTION', facing: 'EAST', contact: '9811122233', tags: ['PARK FACING', 'CORNER'] },
  { id: '2', address: 'FLAT 402, MAGNOLIAS', sector: 'GOLF COURSE ROAD', size: '580', price: '250000000', notes: 'ULTRA LUXURY APARTMENT, FULLY FURNISHED', facing: 'NORTH-EAST', contact: '9988776655', tags: ['GATED SOCIETY'] },
  { id: '3', address: 'PLOT 14, DEFENCE COLONY', sector: 'SOUTH DELHI', size: '300', price: '85000000', notes: 'PARK FACING PLOT', facing: 'NORTH', contact: '9876543210', tags: ['PARK FACING'] },
  { id: '4', address: 'B-34, SECTOR 15, PART 2', sector: 'SECTOR 15', size: '200', price: '45000000', notes: 'BUILDER FLOOR, 2ND FLOOR WITH ROOF', facing: 'SOUTH', contact: '9898989898', tags: ['BUILDER FLOOR'] },
  { id: '5', address: 'C-99, DLF PHASE 3', sector: 'DLF PHASE 3', size: '150', price: '32000000', notes: 'NEAR METRO STATION', facing: 'EAST', contact: '9123456789', tags: ['MAIN ROAD'] },
  { id: '6', address: '14, GULMOHAR PARK', sector: 'SOUTH DELHI', size: '250', price: '60000000', notes: 'DDA PLOT, WELL MAINTAINED', facing: 'WEST', contact: '9988112233', tags: [] },
  { id: '7', address: 'FLAT 8B, JAL VAYU VIHAR', sector: 'SECTOR 21', size: '120', price: '12000000', notes: 'SOCIETY FLAT, OLD BUT STURDY', facing: 'NORTH-WEST', contact: '9711122233', tags: ['GATED SOCIETY'] },
  { id: '8', address: 'SHOP 12, GALLERIA MARKET', sector: 'DLF PHASE 4', size: '45', price: '40000000', notes: 'GROUND FLOOR RETAIL SPACE', facing: 'EAST', contact: '9810020030', tags: ['HIGHWAY FACING'] },
  { id: '9', address: 'TOWER C, FLAT 1104, CLEO COUNTY', sector: 'SECTOR 121', size: '180', price: '21000000', notes: 'RESORT STYLE LIVING', facing: 'NORTH', contact: '9012345678' },
  { id: '10', address: 'PLOT 45, YAMUNA EXPRESSWAY', sector: 'SECTOR 22D', size: '1000', price: '15000000', notes: 'FUTURE INVESTMENT, HIGHWAY FACING', facing: 'SOUTH-EAST', contact: '9911223344' },
  { id: '11', address: 'KOTHI NO 5, SECTOR 8', sector: 'CHANDIGARH', size: '1000', price: '120000000', notes: 'VIP AREA KOTHI', facing: 'NORTH', contact: '9876512345' },
  { id: '12', address: 'FLAT 302, ATS VILLAGE', sector: 'SECTOR 93A', size: '160', price: '18000000', notes: 'GATED COMMUNITY, ON NOIDA EXPRESSWAY', facing: 'EAST', contact: '9988998899' },
  { id: '13', address: 'BLOCK H, SUSHANT LOK 1', sector: 'SUSHANT LOK', size: '220', price: '55000000', notes: 'CORNER PLOT FLOOR', facing: 'NORTH', contact: '9123123123' },
  { id: '14', address: '98, GREATER KAILASH 1', sector: 'GK-1', size: '400', price: '110000000', notes: 'NEAR M-BLOCK MARKET', facing: 'WEST', contact: '9811881188' },
  { id: '15', address: 'VILLA 8, JAYPEE GREENS', sector: 'GREATER NOIDA', size: '600', price: '75000000', notes: 'GOLF COURSE VILLAGE', facing: 'EAST', contact: '9654321098' },
  { id: '16', address: '12A, NEW FRIENDS COLONY', sector: 'NFC', size: '450', price: '95000000', notes: 'EXCELLENT NEIGHBOURHOOD', facing: 'NORTH-EAST', contact: '9999888877' },
  { id: '17', address: 'UNIT 501, PALM SPRINGS', sector: 'GOLF COURSE ROAD', size: '320', price: '80000000', notes: 'HIGH END CONDO', facing: 'SOUTH', contact: '9810111213' },
  { id: '18', address: 'SCO 42, SECTOR 29', sector: 'SECTOR 29', size: '200', price: '60000000', notes: 'COMMERCIAL SCO MARKET', facing: 'NORTH', contact: '9871234567' },
  { id: '19', address: 'PLOT 9, SOUTHERN PERIPHERAL ROAD', sector: 'SECTOR 71', size: '300', price: '35000000', notes: 'UPCOMING COMMERCIAL AREA', facing: 'EAST', contact: '9911991199' },
  { id: '20', address: 'FLAT 1A, UNITECH HERITAGE CITY', sector: 'MG ROAD', size: '240', price: '45000000', notes: 'WALKING DISTANCE TO MALL', facing: 'WEST', contact: '9818123456' },
];

export const PropertyProvider = ({ children }: { children: ReactNode }) => {
  const [properties, setProperties] = useState<Property[]>(initialProperties);

  const addProperty = (property: Omit<Property, 'id'>) => {
    const newProperty: Property = {
      id: Math.random().toString(36).substr(2, 9),
      address: property.address.toUpperCase(),
      sector: property.sector.toUpperCase(),
      size: property.size,
      price: property.price,
      notes: property.notes.toUpperCase(),
      facing: property.facing.toUpperCase(),
      contact: property.contact,
      tags: property.tags || [],
    };
    setProperties((prev) => [...prev, newProperty]);
  };

  const deleteProperty = (id: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== id));
  };

  const updateProperty = (updated: Property) => {
    setProperties((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  return (
    <PropertyContext.Provider value={{ properties, addProperty, deleteProperty, updateProperty }}>
      {children}
    </PropertyContext.Provider>
  );
};
