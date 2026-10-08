import { useState, useEffect } from 'react'
import './App.css'

const STORAGE_KEY = 'transactions'

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const typeLabels = { income: 'Receita', expense: 'Despesa' }

const categoryLabels = {
  salario: 'Salário',
  alimentacao: 'Alimentação',
  lazer: 'Lazer',
  transporte: 'Transporte',
  saude: 'Saúde',
  outros: 'Outros',
}

function loadTransactions() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function App() {
  const [transactions, setTransactions] = useState(loadTransactions)
  const [form, setForm] = useState({
    description: '',
    amount: '',
    type: 'income',
    category: 'salario',
  })
  const [filterType, setFilterType] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')

  // Persistência
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
  }, [transactions])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const description = form.description.trim()
    const amount = Number(form.amount)
    if (!description || !amount || amount <= 0) return

    setTransactions((prev) => [
      ...prev,
      {
        id: Date.now() + Math.floor(Math.random() * 1000),
        description,
        amount,
        type: form.type,
        category: form.category,
      },
    ])
    setForm({ description: '', amount: '', type: 'income', category: 'salario' })
  }

  const removeTransaction = (id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }

  const filtered = transactions.filter(
    (t) =>
      (filterType === 'all' || t.type === filterType) &&
      (filterCategory === 'all' || t.category === filterCategory)
  )

  const incomeTotal = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  const expenseTotal = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
  const balance = incomeTotal - expenseTotal

  const categoryOptions = Object.entries(categoryLabels).map(([value, label]) => (
    <option key={value} value={value}>{label}</option>
  ))

  return (
    <div className="container">
      <header className="header">
        <div className="header-top">
          <span className="brand-mark">MG</span>
          <span className="brand-name">Meus Gastos</span>
        </div>
        <h1>Painel financeiro pessoal</h1>
        <p>Um registro claro de tudo o que entra e sai — para decisões financeiras mais conscientes.</p>
      </header>

      <section className="stats">
        <div className="card">
          <span className="label">Saldo atual</span>
          <span id="balance" className="number">{currencyFormatter.format(balance)}</span>
        </div>
        <div className="card">
          <span className="label">Receitas</span>
          <span id="income-total" className="number blue">{currencyFormatter.format(incomeTotal)}</span>
        </div>
        <div className="card">
          <span className="label">Despesas</span>
          <span id="expense-total" className="number pink">{currencyFormatter.format(expenseTotal)}</span>
        </div>
      </section>

      <section className="panel">
        <h2 className="panel-title">Novo lançamento</h2>

        <form className="add-task" id="form-add" onSubmit={handleSubmit}>
          <input
            type="text"
            id="description"
            name="description"
            placeholder="Descrição do gasto..."
            value={form.description}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            id="amount"
            name="amount"
            className="input-value"
            placeholder="R$ 0,00"
            step="0.01"
            min="0.01"
            value={form.amount}
            onChange={handleChange}
            required
          />
          <select id="type" name="type" className="input-select" value={form.type} onChange={handleChange}>
            <option value="income">Receita</option>
            <option value="expense">Despesa</option>
          </select>
          <select id="category" name="category" className="input-select" value={form.category} onChange={handleChange}>
            {categoryOptions}
          </select>
          <button type="submit" id="btn-add" className="btn-add">
            Adicionar lançamento
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Extrato</h2>
          <div className="filters">
            <select
              id="filter-type"
              className="filter-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Todos os tipos</option>
              <option value="income">Receitas</option>
              <option value="expense">Despesas</option>
            </select>
            <select
              id="filter-category"
              className="filter-select"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">Todas as categorias</option>
              {categoryOptions}
            </select>
          </div>
        </div>

        <section id="transactions" className="tasks">
          {filtered.map((t) => {
            const isIncome = t.type === 'income'
            return (
              <div key={t.id} className={isIncome ? 'transaction-income' : 'transaction-expense'}>
                <div className="transaction-info">
                  <span className="transaction-title">{t.description}</span>
                  <span className="transaction-date">
                    {typeLabels[t.type] || t.type} · {categoryLabels[t.category] || t.category}
                  </span>
                </div>
                <span className={`transaction-amount ${isIncome ? 'income' : 'expense'}`}>
                  {isIncome ? '+ ' : '- '}
                  {currencyFormatter.format(t.amount)}
                </span>
                <button
                  type="button"
                  className="btn-remove"
                  aria-label={`Remover lançamento: ${t.description}`}
                  onClick={() => removeTransaction(t.id)}
                >
                  ×
                </button>
              </div>
            )
          })}
        </section>
      </section>

      <footer className="footer">
        <span>Meus Gastos</span>
        <span>Dados armazenados apenas neste dispositivo</span>
      </footer>
    </div>
  )
}

export default App