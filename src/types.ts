export interface MenuItem {
  id: string;
  nome: string;
  emoji: string;
}

export interface PedidoItem {
  id: string;
  nome: string;
  emoji: string;
}

export interface Pedido {
  id: string;
  mesa: number;
  pratos: PedidoItem[];
  bebidas: PedidoItem[];
  sobremesas: PedidoItem[];
  status: 'pendente' | 'pronto';
  timestamp: string;
}
