import mongoose, { Model } from 'mongoose';

// Define the interface for regional costs
export interface IRegionCost {
  name: string;
  transportCosts: {
    small: number;
    medium: number;
    large: number;
  };
  description: string;
}

// Define the interface for roof type costs
export interface IRoofTypeCost {
  additionalCostPerKw: number;
  installationDetails: string;
}

// Define the interface for solar template
export interface ISolarTemplate {
  name: string;
  description: string;
  defaultBill: number;
  systemSizes: number[];
  costPerKw: number;
  roofTypeCosts: {
    concrete: IRoofTypeCost;
    metal: IRoofTypeCost;
  };
  panelWattage: number;
  electricityReduction: number;
  annualInflation: number;
  panelDegradation: number;
  paybackPeriod: string;
}

// Define the interface for calculator parameters
export interface ICalculatorParams {
  templates: {
    residential: ISolarTemplate;
    commercial: ISolarTemplate;
  };
  regions: {
    [key: string]: IRegionCost;
  };
  additionalCosts: {
    residential: {
      netMeteringProcessingFee: number;
      otherFees: number;
      netMeteringPipingCost: number;
    };
    commercial: {
      netMeteringProcessingFee: number;
      otherFees: number;
      netMeteringPipingCost: number;
    };
  };
  defaultValues: {
    defaultSystemEfficiency: number;
    defaultAnnualRadiation: number;
    defaultPeakSunHours: number;
  };
  updatedAt?: Date;
}

// Define the schema for calculator parameters
const calculatorParamsSchema = new mongoose.Schema<ICalculatorParams>({
  templates: {
    residential: {
      name: { type: String, required: true },
      description: { type: String, required: true },
      defaultBill: { type: Number, required: true },
      systemSizes: { type: [Number], required: true },
      costPerKw: { type: Number, required: true },
      roofTypeCosts: {
        concrete: {
          additionalCostPerKw: { type: Number, required: true },
          installationDetails: { type: String, required: true }
        },
        metal: {
          additionalCostPerKw: { type: Number, required: true },
          installationDetails: { type: String, required: true }
        }
      },
      panelWattage: { type: Number, required: true },
      electricityReduction: { type: Number, required: true },
      annualInflation: { type: Number, required: true },
      panelDegradation: { type: Number, required: true },
      paybackPeriod: { type: String, required: true }
    },
    commercial: {
      name: { type: String, required: true },
      description: { type: String, required: true },
      defaultBill: { type: Number, required: true },
      systemSizes: { type: [Number], required: true },
      costPerKw: { type: Number, required: true },
      roofTypeCosts: {
        concrete: {
          additionalCostPerKw: { type: Number, required: true },
          installationDetails: { type: String, required: true }
        },
        metal: {
          additionalCostPerKw: { type: Number, required: true },
          installationDetails: { type: String, required: true }
        }
      },
      panelWattage: { type: Number, required: true },
      electricityReduction: { type: Number, required: true },
      annualInflation: { type: Number, required: true },
      panelDegradation: { type: Number, required: true },
      paybackPeriod: { type: String, required: true }
    }
  },
  regions: {
    type: Map,
    of: {
      name: { type: String, required: true },
      transportCosts: {
        small: { type: Number, required: true },
        medium: { type: Number, required: true },
        large: { type: Number, required: true }
      },
      description: { type: String, required: true }
    },
    required: true
  },
  additionalCosts: {
    residential: {
      netMeteringProcessingFee: { type: Number, required: true },
      otherFees: { type: Number, required: true },
      netMeteringPipingCost: { type: Number, required: true }
    },
    commercial: {
      netMeteringProcessingFee: { type: Number, required: true },
      otherFees: { type: Number, required: true },
      netMeteringPipingCost: { type: Number, required: true }
    }
  },
  defaultValues: {
    defaultSystemEfficiency: { type: Number, required: true },
    defaultAnnualRadiation: { type: Number, required: true },
    defaultPeakSunHours: { type: Number, required: true }
  }
}, {
  timestamps: true
});

// Check if the model exists before creating it
const SolarCalculatorParams = mongoose.models.SolarCalculatorParams as Model<ICalculatorParams> || 
  mongoose.model<ICalculatorParams>('SolarCalculatorParams', calculatorParamsSchema);

export default SolarCalculatorParams; 