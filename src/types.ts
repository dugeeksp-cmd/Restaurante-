export interface MenuItem {
  id: string;
  nome: string;
  emoji: string;
}

export interface PedidoItem {
  id: string;
  nome: string;
  emoji: string;
  quantidade?: number;
  preco?: number;
  subtotal?: number;
}

export interface Pedido {
  id: string;
  mesa: number;
  pratos?: PedidoItem[];
  bebidas?: PedidoItem[];
  sobremesas?: PedidoItem[];
  itens?: PedidoItem[];
  valorTotal?: number;
  status: 'pendente' | 'pronto';
  timestamp: string;
}
