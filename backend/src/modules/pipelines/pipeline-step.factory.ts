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
    };
  }
}
