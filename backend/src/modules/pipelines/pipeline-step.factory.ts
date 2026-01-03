/**
 * Pipeline Step Factory
 *
 * Creates and manages pipeline step instances.
 */

import { Injectable, Logger } from "@nestjs/common";
import { StepType } from "../../types/step-type";

export interface IStepProcessor {
  process(input: any, config: any): Promise<any>;
}

@Injectable()
export class PipelineStepFactory {
  private readonly logger = new Logger(PipelineStepFactory.name);

  getProcessor(type: StepType): IStepProcessor {
    switch (type) {
      case StepType.READ_FILE:
        return new ReadFileProcessor();
      case StepType.CUSTOM_SCRIPT:
        return new CustomScriptProcessor();
      case StepType.READ_API:
        return new ReadApiProcessor();
      case StepType.AGGREGATE_DATA:
        return new AggregateDataProcessor();
      // Add other cases as needed
      default:
        return new MockProcessor(type);
    }
  }
}

class ReadFileProcessor implements IStepProcessor {
  async process(input: any, config: any): Promise<any> {
    // Stub implementation
    return {
      message: "File read simulated",
      path: config?.filePath || "unknown",
      rows: 100, // Dummy data
      data: input || [],
    };
  }
}

class CustomScriptProcessor implements IStepProcessor {
  async process(input: any, config: any): Promise<any> {
    // Stub implementation
    // In a real system, this might use vm2 or isolated-vm
    return {
      message: "Script executed simulated",
      script: config?.script?.substring(0, 50) + "...",
      result: "success",
      inputCount: Array.isArray(input) ? input.length : 0,
    };
  }
}

class MockProcessor implements IStepProcessor {
  constructor(private type: string) { }

  async process(input: any, config: any): Promise<any> {
    return {
      message: `Step type ${this.type} processed successfully (Mock)`,
      config,
      inputSize: Array.isArray(input) ? input.length : 0,
      data: input || [] // Ensure data is passed through
    };
  }
}

class ReadApiProcessor implements IStepProcessor {
  async process(input: any, config: any): Promise<any> {
    // Simulate API call
    // In real implementation, use axios/fetch
    const mockData = [
      { account_id: "ACC-001", amount: 1000, currency: "USD", date: "2024-01-01" },
      { account_id: "ACC-001", amount: 500, currency: "USD", date: "2024-01-02" },
      { account_id: "ACC-002", amount: 750, currency: "EUR", date: "2024-01-01" },
      { account_id: "ACC-002", amount: 250, currency: "EUR", date: "2024-01-03" }
    ];

    return {
      message: `Simulated API call to ${config?.endpoint || 'unknown'}`,
      data: mockData,
      status: 200
    };
  }
}

class AggregateDataProcessor implements IStepProcessor {
  async process(input: any, config: any): Promise<any> {
    const data = Array.isArray(input) ? input : [];
    const groupBy = config?.groupBy || [];

    // Simple aggregation logic
    const groups: Record<string, any> = {};

    data.forEach(item => {
      const key = groupBy.map((k: string) => item[k]).join(':');
      if (!groups[key]) {
        groups[key] = { ...item, count: 0, totalAmount: 0 };
      }
      groups[key].count++;
      if (item.amount) groups[key].totalAmount += Number(item.amount);
    });

    return {
      message: `Aggregated ${data.length} items into ${Object.keys(groups).length} groups`,
      data: Object.values(groups)
    };
  }
}
