import { NEXT_STATUS, ORDER_STATUS_LABELS, canCancel } from './order.model';

describe('order.model', () => {
  it('avança na ordem Pendente → Em preparação → Pronto → Finalizado', () => {
    expect(NEXT_STATUS['PENDING']?.status).toBe('IN_PREPARATION');
    expect(NEXT_STATUS['IN_PREPARATION']?.status).toBe('READY');
    expect(NEXT_STATUS['READY']?.status).toBe('FINISHED');
  });

  it('não avança pedidos finalizados ou cancelados', () => {
    expect(NEXT_STATUS['FINISHED']).toBeUndefined();
    expect(NEXT_STATUS['CANCELED']).toBeUndefined();
  });

  it('só permite cancelar pedidos que ainda não terminaram', () => {
    expect(canCancel('PENDING')).toBe(true);
    expect(canCancel('READY')).toBe(true);
    expect(canCancel('FINISHED')).toBe(false);
    expect(canCancel('CANCELED')).toBe(false);
  });

  it('tem um rótulo em português para cada status', () => {
    expect(ORDER_STATUS_LABELS.IN_PREPARATION).toBe('Em preparação');
  });
});
