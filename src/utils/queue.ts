export interface QueueOptions {
  timeout?: number; // ms
  max?: number;
}
export class Queue {
  private _count: number = 0;
  private _taskList: Array<{ task: Function; id: string }> = [];
  private _max: number = 1;
  private _timeout: number = 30 * 60 * 1000;
  constructor(options?: QueueOptions) {
    if (options?.max || options?.max === 0) {
      this._max = options.max;
    }
    if (options?.timeout) {
      this._timeout = options.timeout;
    }

    this._count = 0;
    this._taskList = [];
  }
  // 添加任务
  trigger(fn: Function, params: any, id: string = '') {
    return new Promise((res, rej) => {
      const task = this._execute(fn, params, res, rej);
      // 运行的任务不超过最大个数，则运行
      if (this._count < this._max) {
        task();
      } else {
        // 否则入队列
        this._taskList.push({ task, id });
        // console.log('=-------------->存在队列', this._taskList.length);
      }
    });
  }
  // 运行
  _execute(fn: Function, params: any, res: any, rej: any) {
    return () => {
      this._count++;
      let executeFlag = true;
      const timer = setTimeout(() => {
        console.error('queue-warning: 任务执行超时');
        clearTimeout(timer);
        this._count > 0 && this._count--;
        executeFlag = false;
        rej(new Error('任务执行超时'));
        this._next();
      }, this._timeout);
      fn(params)
        .then(res)
        .catch(rej)
        .finally(() => {
          this._count > 0 && this._count--;
          clearTimeout(timer);
          if (executeFlag) {
            this._next();
          }
        });
    };
  }
  // 下一个任务
  _next() {
    if (this._taskList.length > 0) {
      const taskItem = this._taskList.shift();
      taskItem && taskItem.task && taskItem.task();
    }
  }
  // 取消任务
  cancel(id: string) {
    if (!id) return;
    this._taskList = this._taskList.filter((x) => x.id !== id);
  }
}
