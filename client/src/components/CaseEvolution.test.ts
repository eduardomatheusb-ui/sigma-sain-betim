import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CaseEvolution } from './CaseEvolution';

describe('CaseEvolution Component', () => {
  it('renders component with title', () => {
    render(<CaseEvolution caseId={1} />);
    expect(screen.getByText('Evolução do Caso')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    render(<CaseEvolution caseId={1} isLoading={true} />);
    expect(screen.getByText('Carregando evolução...')).toBeInTheDocument();
  });

  it('renders register button', () => {
    render(<CaseEvolution caseId={1} />);
    const registerButton = screen.getByRole('button', { name: /registrar/i });
    expect(registerButton).toBeInTheDocument();
  });

  it('displays empty state when no evolution entries', () => {
    render(<CaseEvolution caseId={1} />);
    expect(screen.getByText('Nenhuma evolução registrada ainda.')).toBeInTheDocument();
  });

  it('renders evolution entries with status badges', () => {
    render(<CaseEvolution caseId={1} />);
    expect(screen.getByText('Progresso')).toBeInTheDocument();
    expect(screen.getByText('Estável')).toBeInTheDocument();
  });

  it('opens dialog when register button is clicked', async () => {
    render(<CaseEvolution caseId={1} />);
    const registerButton = screen.getByRole('button', { name: /registrar/i });
    fireEvent.click(registerButton);
    await waitFor(() => {
      expect(screen.getByText('Registrar Evolução do Caso')).toBeInTheDocument();
    });
  });

  it('has date, status, and description fields in dialog', async () => {
    render(<CaseEvolution caseId={1} />);
    const registerButton = screen.getByRole('button', { name: /registrar/i });
    fireEvent.click(registerButton);
    await waitFor(() => {
      expect(screen.getByLabelText('Data')).toBeInTheDocument();
      expect(screen.getByLabelText('Status')).toBeInTheDocument();
      expect(screen.getByLabelText('Descrição')).toBeInTheDocument();
    });
  });

  it('renders status options in select', async () => {
    render(<CaseEvolution caseId={1} />);
    const registerButton = screen.getByRole('button', { name: /registrar/i });
    fireEvent.click(registerButton);
    await waitFor(() => {
      expect(screen.getByText('Progresso')).toBeInTheDocument();
      expect(screen.getByText('Estável')).toBeInTheDocument();
      expect(screen.getByText('Regressão')).toBeInTheDocument();
      expect(screen.getByText('Encerrado')).toBeInTheDocument();
    });
  });

  it('renders delete buttons for each entry', () => {
    render(<CaseEvolution caseId={1} />);
    const deleteButtons = screen.getAllByRole('button').filter(btn => 
      btn.querySelector('svg[class*="Trash"]')
    );
    expect(deleteButtons.length).toBeGreaterThan(0);
  });

  it('renders evolution entries in correct order (newest first)', () => {
    render(<CaseEvolution caseId={1} />);
    const entries = screen.getAllByText(/Maria Oliveira|Carlos Mendes/);
    expect(entries[0]).toHaveTextContent('Maria Oliveira');
    expect(entries[1]).toHaveTextContent('Carlos Mendes');
  });

  it('displays evolution descriptions', () => {
    render(<CaseEvolution caseId={1} />);
    expect(screen.getByText(/Aluno compareceu a reunião com família/)).toBeInTheDocument();
    expect(screen.getByText(/Continuação do atendimento/)).toBeInTheDocument();
  });

  it('renders correct number of evolution entries', () => {
    render(<CaseEvolution caseId={1} />);
    const entries = screen.getAllByText(/Progresso|Estável/);
    expect(entries.length).toBeGreaterThanOrEqual(2);
  });

  it('handles null caseId gracefully', () => {
    render(<CaseEvolution caseId={null} />);
    expect(screen.getByText('Evolução do Caso')).toBeInTheDocument();
  });

  it('renders timeline visual elements', () => {
    render(<CaseEvolution caseId={1} />);
    const circles = screen.getAllByRole('img').filter(img => 
      img.className.includes('Circle')
    );
    expect(circles.length).toBeGreaterThan(0);
  });
});
