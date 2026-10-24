export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      agentes_politicos: {
        Row: {
          biografia: string | null
          cargo: string
          chave_externa: string | null
          created_at: string
          email: string | null
          foto_url: string | null
          id: string
          mandato: string | null
          nome: string
          ordem: number | null
          origem: string | null
          partido: string | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          biografia?: string | null
          cargo: string
          chave_externa?: string | null
          created_at?: string
          email?: string | null
          foto_url?: string | null
          id?: string
          mandato?: string | null
          nome: string
          ordem?: number | null
          origem?: string | null
          partido?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          biografia?: string | null
          cargo?: string
          chave_externa?: string | null
          created_at?: string
          email?: string | null
          foto_url?: string | null
          id?: string
          mandato?: string | null
          nome?: string
          ordem?: number | null
          origem?: string | null
          partido?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      albuns: {
        Row: {
          capa_url: string | null
          created_at: string
          data: string | null
          descricao: string | null
          fotos: string[] | null
          id: string
          legendas: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          capa_url?: string | null
          created_at?: string
          data?: string | null
          descricao?: string | null
          fotos?: string[] | null
          id?: string
          legendas?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          capa_url?: string | null
          created_at?: string
          data?: string | null
          descricao?: string | null
          fotos?: string[] | null
          id?: string
          legendas?: string | null
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      arquivos_binarios: {
        Row: {
          conteudo: string
          created_at: string
          id: string
          mime: string
          nome: string
          sha256: string | null
          storage_path: string
          tamanho: number | null
          user_id: string
        }
        Insert: {
          conteudo: string
          created_at?: string
          id?: string
          mime: string
          nome: string
          sha256?: string | null
          storage_path: string
          tamanho?: number | null
          user_id?: string
        }
        Update: {
          conteudo?: string
          created_at?: string
          id?: string
          mime?: string
          nome?: string
          sha256?: string | null
          storage_path?: string
          tamanho?: number | null
          user_id?: string
        }
        Relationships: []
      }
      atendimentos: {
        Row: {
          anonimo: boolean | null
          assunto: string
          canal: string
          created_at: string
          email: string | null
          id: string
          justificativa_prorrogacao: string | null
          mensagem: string
          nome: string | null
          prorrogado: boolean
          prorrogado_em: string | null
          protocolo: string
          protocolo_origem: string | null
          respondido_em: string | null
          resposta: string | null
          setor_destino: string | null
          status: string
          telefone: string | null
          tipo: string | null
          updated_at: string
        }
        Insert: {
          anonimo?: boolean | null
          assunto: string
          canal?: string
          created_at?: string
          email?: string | null
          id?: string
          justificativa_prorrogacao?: string | null
          mensagem: string
          nome?: string | null
          prorrogado?: boolean
          prorrogado_em?: string | null
          protocolo?: string
          protocolo_origem?: string | null
          respondido_em?: string | null
          resposta?: string | null
          setor_destino?: string | null
          status?: string
          telefone?: string | null
          tipo?: string | null
          updated_at?: string
        }
        Update: {
          anonimo?: boolean | null
          assunto?: string
          canal?: string
          created_at?: string
          email?: string | null
          id?: string
          justificativa_prorrogacao?: string | null
          mensagem?: string
          nome?: string | null
          prorrogado?: boolean
          prorrogado_em?: string | null
          protocolo?: string
          protocolo_origem?: string | null
          respondido_em?: string | null
          resposta?: string | null
          setor_destino?: string | null
          status?: string
          telefone?: string | null
          tipo?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "atendimentos_protocolo_origem_fkey"
            columns: ["protocolo_origem"]
            isOneToOne: false
            referencedRelation: "atendimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      atricon_avaliacoes: {
        Row: {
          criterio: string
          link: string | null
          observacao: string | null
          status: string
          updated_at: string
        }
        Insert: {
          criterio: string
          link?: string | null
          observacao?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          criterio?: string
          link?: string | null
          observacao?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      atricon_relatorios: {
        Row: {
          analise_ia: string
          created_at: string
          id: string
          modelo: string
          resultados: Json
          texto: string
          user_id: string
        }
        Insert: {
          analise_ia: string
          created_at?: string
          id?: string
          modelo: string
          resultados: Json
          texto: string
          user_id?: string
        }
        Update: {
          analise_ia?: string
          created_at?: string
          id?: string
          modelo?: string
          resultados?: Json
          texto?: string
          user_id?: string
        }
        Relationships: []
      }
      auditoria: {
        Row: {
          acao: string
          created_at: string
          dados: Json | null
          id: number
          registro_id: string | null
          tabela: string
          user_id: string | null
        }
        Insert: {
          acao: string
          created_at?: string
          dados?: Json | null
          id?: number
          registro_id?: string | null
          tabela: string
          user_id?: string | null
        }
        Update: {
          acao?: string
          created_at?: string
          dados?: Json | null
          id?: number
          registro_id?: string | null
          tabela?: string
          user_id?: string | null
        }
        Relationships: []
      }
      banners: {
        Row: {
          ativo: boolean | null
          created_at: string
          fim: string | null
          id: string
          imagem_url: string | null
          inicio: string | null
          link: string | null
          ordem: number | null
          titulo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          fim?: string | null
          id?: string
          imagem_url?: string | null
          inicio?: string | null
          link?: string | null
          ordem?: number | null
          titulo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          fim?: string | null
          id?: string
          imagem_url?: string | null
          inicio?: string | null
          link?: string | null
          ordem?: number | null
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      comissoes: {
        Row: {
          created_at: string
          data_fim: string | null
          data_inicio: string | null
          id: string
          nome: string
          portaria: string | null
          tipo: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          nome: string
          portaria?: string | null
          tipo?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          nome?: string
          portaria?: string | null
          tipo?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      configuracoes_site: {
        Row: {
          chave: string
          updated_at: string
          valor: string | null
        }
        Insert: {
          chave: string
          updated_at?: string
          valor?: string | null
        }
        Update: {
          chave?: string
          updated_at?: string
          valor?: string | null
        }
        Relationships: []
      }
      conselho_acoes: {
        Row: {
          arquivo_url: string | null
          conselho_id: string
          created_at: string
          data: string
          descricao: string | null
          id: string
          tipo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          arquivo_url?: string | null
          conselho_id: string
          created_at?: string
          data: string
          descricao?: string | null
          id?: string
          tipo: string
          titulo: string
          updated_at?: string
        }
        Update: {
          arquivo_url?: string | null
          conselho_id?: string
          created_at?: string
          data?: string
          descricao?: string | null
          id?: string
          tipo?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conselho_acoes_conselho_id_fkey"
            columns: ["conselho_id"]
            isOneToOne: false
            referencedRelation: "conselhos"
            referencedColumns: ["id"]
          },
        ]
      }
      conselho_membros: {
        Row: {
          ativo: boolean
          conselho_id: string
          created_at: string
          entidade: string | null
          fim: string | null
          id: string
          inicio: string | null
          nome: string
          representacao: string
          tipo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          conselho_id: string
          created_at?: string
          entidade?: string | null
          fim?: string | null
          id?: string
          inicio?: string | null
          nome: string
          representacao: string
          tipo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          conselho_id?: string
          created_at?: string
          entidade?: string | null
          fim?: string | null
          id?: string
          inicio?: string | null
          nome?: string
          representacao?: string
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conselho_membros_conselho_id_fkey"
            columns: ["conselho_id"]
            isOneToOne: false
            referencedRelation: "conselhos"
            referencedColumns: ["id"]
          },
        ]
      }
      conselhos: {
        Row: {
          competencias: string | null
          contato: string | null
          cor: string | null
          created_at: string
          data_criacao: string | null
          descricao: string | null
          id: string
          imagem_url: string | null
          lei_criacao: string | null
          membros: string | null
          nome: string
          presidente: string | null
          sigla: string | null
          updated_at: string
          vigencia_fim: string | null
          vigencia_inicio: string | null
        }
        Insert: {
          competencias?: string | null
          contato?: string | null
          cor?: string | null
          created_at?: string
          data_criacao?: string | null
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          lei_criacao?: string | null
          membros?: string | null
          nome: string
          presidente?: string | null
          sigla?: string | null
          updated_at?: string
          vigencia_fim?: string | null
          vigencia_inicio?: string | null
        }
        Update: {
          competencias?: string | null
          contato?: string | null
          cor?: string | null
          created_at?: string
          data_criacao?: string | null
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          lei_criacao?: string | null
          membros?: string | null
          nome?: string
          presidente?: string | null
          sigla?: string | null
          updated_at?: string
          vigencia_fim?: string | null
          vigencia_inicio?: string | null
        }
        Relationships: []
      }
      contratos: {
        Row: {
          acao_emergencial: string | null
          arquivo_url: string | null
          cnpj: string | null
          contrato_origem: string | null
          convenio_id: string | null
          created_at: string
          data_fim: string | null
          data_fim_atualizada: string | null
          data_inicio: string | null
          fornecedor: string
          id: string
          licitacao_numero: string | null
          numero: string
          objeto: string
          secretaria: string | null
          tipo: string | null
          updated_at: string
          valor: number | null
          valor_atualizado: number | null
        }
        Insert: {
          acao_emergencial?: string | null
          arquivo_url?: string | null
          cnpj?: string | null
          contrato_origem?: string | null
          convenio_id?: string | null
          created_at?: string
          data_fim?: string | null
          data_fim_atualizada?: string | null
          data_inicio?: string | null
          fornecedor: string
          id?: string
          licitacao_numero?: string | null
          numero: string
          objeto: string
          secretaria?: string | null
          tipo?: string | null
          updated_at?: string
          valor?: number | null
          valor_atualizado?: number | null
        }
        Update: {
          acao_emergencial?: string | null
          arquivo_url?: string | null
          cnpj?: string | null
          contrato_origem?: string | null
          convenio_id?: string | null
          created_at?: string
          data_fim?: string | null
          data_fim_atualizada?: string | null
          data_inicio?: string | null
          fornecedor?: string
          id?: string
          licitacao_numero?: string | null
          numero?: string
          objeto?: string
          secretaria?: string | null
          tipo?: string | null
          updated_at?: string
          valor?: number | null
          valor_atualizado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_convenio_id_fkey"
            columns: ["convenio_id"]
            isOneToOne: false
            referencedRelation: "convenios"
            referencedColumns: ["id"]
          },
        ]
      }
      convenio_entidades: {
        Row: {
          cnpj: string | null
          created_at: string
          id: string
          nome: string
          papel: string
          responsavel: string | null
          updated_at: string
        }
        Insert: {
          cnpj?: string | null
          created_at?: string
          id?: string
          nome: string
          papel: string
          responsavel?: string | null
          updated_at?: string
        }
        Update: {
          cnpj?: string | null
          created_at?: string
          id?: string
          nome?: string
          papel?: string
          responsavel?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      convenio_obrigacoes: {
        Row: {
          convenio_id: string
          created_at: string
          cumprida_em: string | null
          descricao: string | null
          id: string
          situacao: string
          titulo: string
          updated_at: string
          vencimento: string | null
        }
        Insert: {
          convenio_id: string
          created_at?: string
          cumprida_em?: string | null
          descricao?: string | null
          id?: string
          situacao?: string
          titulo: string
          updated_at?: string
          vencimento?: string | null
        }
        Update: {
          convenio_id?: string
          created_at?: string
          cumprida_em?: string | null
          descricao?: string | null
          id?: string
          situacao?: string
          titulo?: string
          updated_at?: string
          vencimento?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "convenio_obrigacoes_convenio_id_fkey"
            columns: ["convenio_id"]
            isOneToOne: false
            referencedRelation: "convenios"
            referencedColumns: ["id"]
          },
        ]
      }
      convenio_parcelas: {
        Row: {
          convenio_id: string
          created_at: string
          descricao: string | null
          id: string
          numero: number
          recebido_em: string | null
          status: string
          updated_at: string
          valor: number
          vencimento: string | null
        }
        Insert: {
          convenio_id: string
          created_at?: string
          descricao?: string | null
          id?: string
          numero: number
          recebido_em?: string | null
          status?: string
          updated_at?: string
          valor: number
          vencimento?: string | null
        }
        Update: {
          convenio_id?: string
          created_at?: string
          descricao?: string | null
          id?: string
          numero?: number
          recebido_em?: string | null
          status?: string
          updated_at?: string
          valor?: number
          vencimento?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "convenio_parcelas_convenio_id_fkey"
            columns: ["convenio_id"]
            isOneToOne: false
            referencedRelation: "convenios"
            referencedColumns: ["id"]
          },
        ]
      }
      convenio_tipos: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      convenios: {
        Row: {
          arquivo_url: string | null
          categoria: string | null
          concedente: string
          contrapartida: number | null
          contrato_numero: string | null
          convenente: string | null
          created_at: string
          data_fim: string | null
          data_inicio: string | null
          especificacoes_tecnicas: string | null
          id: string
          metas: string | null
          numero: string
          objeto: string
          observacoes: string | null
          periodicidade_prestacao: string | null
          plano_aplicacao: string | null
          responsavel_concedente: string | null
          responsavel_convenente: string | null
          situacao: string | null
          tipo: string | null
          updated_at: string
          valor: number | null
          valor_global: number | null
        }
        Insert: {
          arquivo_url?: string | null
          categoria?: string | null
          concedente: string
          contrapartida?: number | null
          contrato_numero?: string | null
          convenente?: string | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          especificacoes_tecnicas?: string | null
          id?: string
          metas?: string | null
          numero: string
          objeto: string
          observacoes?: string | null
          periodicidade_prestacao?: string | null
          plano_aplicacao?: string | null
          responsavel_concedente?: string | null
          responsavel_convenente?: string | null
          situacao?: string | null
          tipo?: string | null
          updated_at?: string
          valor?: number | null
          valor_global?: number | null
        }
        Update: {
          arquivo_url?: string | null
          categoria?: string | null
          concedente?: string
          contrapartida?: number | null
          contrato_numero?: string | null
          convenente?: string | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          especificacoes_tecnicas?: string | null
          id?: string
          metas?: string | null
          numero?: string
          objeto?: string
          observacoes?: string | null
          periodicidade_prestacao?: string | null
          plano_aplicacao?: string | null
          responsavel_concedente?: string | null
          responsavel_convenente?: string | null
          situacao?: string | null
          tipo?: string | null
          updated_at?: string
          valor?: number | null
          valor_global?: number | null
        }
        Relationships: []
      }
      credores: {
        Row: {
          chave_externa: string | null
          cpf_cnpj: string | null
          created_at: string
          id: string
          municipio: string | null
          nome: string
          origem: string | null
          tipo: string | null
          uf: string | null
          updated_at: string
        }
        Insert: {
          chave_externa?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          id?: string
          municipio?: string | null
          nome: string
          origem?: string | null
          tipo?: string | null
          uf?: string | null
          updated_at?: string
        }
        Update: {
          chave_externa?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          id?: string
          municipio?: string | null
          nome?: string
          origem?: string | null
          tipo?: string | null
          uf?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      despesas: {
        Row: {
          acao_emergencial: string | null
          ano: number
          chave_externa: string | null
          created_at: string
          credor: string | null
          data_empenho: string | null
          data_liquidacao: string | null
          data_pagamento: string | null
          elemento: string | null
          empenhado: number | null
          empenho: string | null
          fonte_recurso: string | null
          funcao: string | null
          id: string
          liquidacao: string | null
          liquidado: number | null
          mes: number
          natureza: string | null
          ordem_bancaria: string | null
          orgao: string
          origem: string | null
          pago: number | null
          processo: string | null
          updated_at: string
        }
        Insert: {
          acao_emergencial?: string | null
          ano: number
          chave_externa?: string | null
          created_at?: string
          credor?: string | null
          data_empenho?: string | null
          data_liquidacao?: string | null
          data_pagamento?: string | null
          elemento?: string | null
          empenhado?: number | null
          empenho?: string | null
          fonte_recurso?: string | null
          funcao?: string | null
          id?: string
          liquidacao?: string | null
          liquidado?: number | null
          mes: number
          natureza?: string | null
          ordem_bancaria?: string | null
          orgao: string
          origem?: string | null
          pago?: number | null
          processo?: string | null
          updated_at?: string
        }
        Update: {
          acao_emergencial?: string | null
          ano?: number
          chave_externa?: string | null
          created_at?: string
          credor?: string | null
          data_empenho?: string | null
          data_liquidacao?: string | null
          data_pagamento?: string | null
          elemento?: string | null
          empenhado?: number | null
          empenho?: string | null
          fonte_recurso?: string | null
          funcao?: string | null
          id?: string
          liquidacao?: string | null
          liquidado?: number | null
          mes?: number
          natureza?: string | null
          ordem_bancaria?: string | null
          orgao?: string
          origem?: string | null
          pago?: number | null
          processo?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      documentos: {
        Row: {
          arquivo_url: string | null
          created_at: string
          data: string | null
          descricao: string | null
          id: string
          tipo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          arquivo_url?: string | null
          created_at?: string
          data?: string | null
          descricao?: string | null
          id?: string
          tipo?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          arquivo_url?: string | null
          created_at?: string
          data?: string | null
          descricao?: string | null
          id?: string
          tipo?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      empresas_inidoneas: {
        Row: {
          cnpj: string | null
          created_at: string
          data_fim: string | null
          data_inicio: string | null
          id: string
          motivo: string | null
          razao_social: string
          sancao: string | null
          updated_at: string
        }
        Insert: {
          cnpj?: string | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          motivo?: string | null
          razao_social: string
          sancao?: string | null
          updated_at?: string
        }
        Update: {
          cnpj?: string | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          motivo?: string | null
          razao_social?: string
          sancao?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      licitacao_andamentos: {
        Row: {
          arquivo_url: string | null
          created_at: string
          data: string | null
          descricao: string | null
          fase: string
          id: string
          licitacao_numero: string
          updated_at: string
        }
        Insert: {
          arquivo_url?: string | null
          created_at?: string
          data?: string | null
          descricao?: string | null
          fase: string
          id?: string
          licitacao_numero: string
          updated_at?: string
        }
        Update: {
          arquivo_url?: string | null
          created_at?: string
          data?: string | null
          descricao?: string | null
          fase?: string
          id?: string
          licitacao_numero?: string
          updated_at?: string
        }
        Relationships: []
      }
      licitacoes: {
        Row: {
          arquivo_url: string | null
          created_at: string
          data_abertura: string | null
          fundamentacao: string | null
          id: string
          modalidade: string
          numero: string
          objeto: string
          secretaria: string | null
          situacao: string | null
          tipo: string | null
          updated_at: string
          valor_estimado: number | null
        }
        Insert: {
          arquivo_url?: string | null
          created_at?: string
          data_abertura?: string | null
          fundamentacao?: string | null
          id?: string
          modalidade?: string
          numero: string
          objeto: string
          secretaria?: string | null
          situacao?: string | null
          tipo?: string | null
          updated_at?: string
          valor_estimado?: number | null
        }
        Update: {
          arquivo_url?: string | null
          created_at?: string
          data_abertura?: string | null
          fundamentacao?: string | null
          id?: string
          modalidade?: string
          numero?: string
          objeto?: string
          secretaria?: string | null
          situacao?: string | null
          tipo?: string | null
          updated_at?: string
          valor_estimado?: number | null
        }
        Relationships: []
      }
      links_uteis: {
        Row: {
          ativo: boolean | null
          created_at: string
          icone: string | null
          id: string
          ordem: number | null
          titulo: string
          updated_at: string
          url: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          icone?: string | null
          id?: string
          ordem?: number | null
          titulo: string
          updated_at?: string
          url: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          icone?: string | null
          id?: string
          ordem?: number | null
          titulo?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      medicamentos: {
        Row: {
          categoria: string
          created_at: string
          descricao: string
          grupo: string
          id: string
          subcategoria: string
          subgrupo: string
          unidade_compra: string
          unidade_estoque: string
          updated_at: string
        }
        Insert: {
          categoria: string
          created_at?: string
          descricao: string
          grupo: string
          id?: string
          subcategoria: string
          subgrupo: string
          unidade_compra: string
          unidade_estoque: string
          updated_at?: string
        }
        Update: {
          categoria?: string
          created_at?: string
          descricao?: string
          grupo?: string
          id?: string
          subcategoria?: string
          subgrupo?: string
          unidade_compra?: string
          unidade_estoque?: string
          updated_at?: string
        }
        Relationships: []
      }
      membros_equipe: {
        Row: {
          comissao: string | null
          created_at: string
          funcao: string | null
          id: string
          nome: string
          tipo_equipe: string | null
          updated_at: string
        }
        Insert: {
          comissao?: string | null
          created_at?: string
          funcao?: string | null
          id?: string
          nome: string
          tipo_equipe?: string | null
          updated_at?: string
        }
        Update: {
          comissao?: string | null
          created_at?: string
          funcao?: string | null
          id?: string
          nome?: string
          tipo_equipe?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      midias: {
        Row: {
          created_at: string
          data: string | null
          descricao: string | null
          id: string
          tipo: string
          titulo: string
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          data?: string | null
          descricao?: string | null
          id?: string
          tipo?: string
          titulo: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          data?: string | null
          descricao?: string | null
          id?: string
          tipo?: string
          titulo?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      municipio_informacoes: {
        Row: {
          categoria: string
          contato: string | null
          created_at: string
          data_evento: string | null
          descricao: string
          endereco: string | null
          foto_url: string | null
          horario: string | null
          id: string
          titulo: string
          updated_at: string
        }
        Insert: {
          categoria: string
          contato?: string | null
          created_at?: string
          data_evento?: string | null
          descricao: string
          endereco?: string | null
          foto_url?: string | null
          horario?: string | null
          id?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          categoria?: string
          contato?: string | null
          created_at?: string
          data_evento?: string | null
          descricao?: string
          endereco?: string | null
          foto_url?: string | null
          horario?: string | null
          id?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      noticias: {
        Row: {
          agendar_para: string | null
          audio_url: string | null
          capa_url: string | null
          categoria: string | null
          conteudo: string | null
          created_at: string
          evento: string | null
          evento_data: string | null
          evento_local: string | null
          id: string
          publicado: boolean
          publicado_em: string
          resumo: string | null
          slug: string | null
          tags: string[] | null
          titulo: string
          updated_at: string
          video_url: string | null
          visualizacoes: number
        }
        Insert: {
          agendar_para?: string | null
          audio_url?: string | null
          capa_url?: string | null
          categoria?: string | null
          conteudo?: string | null
          created_at?: string
          evento?: string | null
          evento_data?: string | null
          evento_local?: string | null
          id?: string
          publicado?: boolean
          publicado_em?: string
          resumo?: string | null
          slug?: string | null
          tags?: string[] | null
          titulo: string
          updated_at?: string
          video_url?: string | null
          visualizacoes?: number
        }
        Update: {
          agendar_para?: string | null
          audio_url?: string | null
          capa_url?: string | null
          categoria?: string | null
          conteudo?: string | null
          created_at?: string
          evento?: string | null
          evento_data?: string | null
          evento_local?: string | null
          id?: string
          publicado?: boolean
          publicado_em?: string
          resumo?: string | null
          slug?: string | null
          tags?: string[] | null
          titulo?: string
          updated_at?: string
          video_url?: string | null
          visualizacoes?: number
        }
        Relationships: []
      }
      obra_andamentos: {
        Row: {
          created_at: string
          data: string
          descricao: string
          id: string
          obra_id: string
          percentual: number | null
          updated_at: string
          valor_executado: number | null
        }
        Insert: {
          created_at?: string
          data: string
          descricao: string
          id?: string
          obra_id: string
          percentual?: number | null
          updated_at?: string
          valor_executado?: number | null
        }
        Update: {
          created_at?: string
          data?: string
          descricao?: string
          id?: string
          obra_id?: string
          percentual?: number | null
          updated_at?: string
          valor_executado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "obra_andamentos_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      obra_arts: {
        Row: {
          arquivo_url: string | null
          created_at: string
          data: string | null
          id: string
          numero: string
          obra_id: string
          registro_profissional: string | null
          responsavel: string
          updated_at: string
        }
        Insert: {
          arquivo_url?: string | null
          created_at?: string
          data?: string | null
          id?: string
          numero: string
          obra_id: string
          registro_profissional?: string | null
          responsavel: string
          updated_at?: string
        }
        Update: {
          arquivo_url?: string | null
          created_at?: string
          data?: string | null
          id?: string
          numero?: string
          obra_id?: string
          registro_profissional?: string | null
          responsavel?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "obra_arts_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      obra_fotos: {
        Row: {
          created_at: string
          data: string
          foto_url: string
          id: string
          legenda: string
          obra_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data: string
          foto_url: string
          id?: string
          legenda: string
          obra_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: string
          foto_url?: string
          id?: string
          legenda?: string
          obra_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "obra_fotos_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      obra_medicoes: {
        Row: {
          aprovada: boolean
          arquivo_url: string | null
          created_at: string
          data: string
          descricao: string
          id: string
          numero: string
          obra_id: string
          responsavel: string | null
          updated_at: string
          valor: number
        }
        Insert: {
          aprovada?: boolean
          arquivo_url?: string | null
          created_at?: string
          data: string
          descricao: string
          id?: string
          numero: string
          obra_id: string
          responsavel?: string | null
          updated_at?: string
          valor: number
        }
        Update: {
          aprovada?: boolean
          arquivo_url?: string | null
          created_at?: string
          data?: string
          descricao?: string
          id?: string
          numero?: string
          obra_id?: string
          responsavel?: string | null
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "obra_medicoes_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      obras: {
        Row: {
          aditivo_acrescimo: number | null
          aditivo_supressao: number | null
          art: string | null
          contrato_id: string | null
          created_at: string
          credor_id: string | null
          data_fim: string | null
          data_inicio: string | null
          descricao: string | null
          empresa: string | null
          fotos: string[] | null
          id: string
          justificativa: string | null
          local: string | null
          nome: string
          numero_processo: string | null
          objeto_contrato: string | null
          origem_recurso: string | null
          percentual: number | null
          previsao_fim: string | null
          processo_engenharia_id: string | null
          secretaria: string | null
          situacao: string | null
          tipo_guarda_chuva: string | null
          updated_at: string
          valor: number | null
        }
        Insert: {
          aditivo_acrescimo?: number | null
          aditivo_supressao?: number | null
          art?: string | null
          contrato_id?: string | null
          created_at?: string
          credor_id?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          empresa?: string | null
          fotos?: string[] | null
          id?: string
          justificativa?: string | null
          local?: string | null
          nome: string
          numero_processo?: string | null
          objeto_contrato?: string | null
          origem_recurso?: string | null
          percentual?: number | null
          previsao_fim?: string | null
          processo_engenharia_id?: string | null
          secretaria?: string | null
          situacao?: string | null
          tipo_guarda_chuva?: string | null
          updated_at?: string
          valor?: number | null
        }
        Update: {
          aditivo_acrescimo?: number | null
          aditivo_supressao?: number | null
          art?: string | null
          contrato_id?: string | null
          created_at?: string
          credor_id?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          empresa?: string | null
          fotos?: string[] | null
          id?: string
          justificativa?: string | null
          local?: string | null
          nome?: string
          numero_processo?: string | null
          objeto_contrato?: string | null
          origem_recurso?: string | null
          percentual?: number | null
          previsao_fim?: string | null
          processo_engenharia_id?: string | null
          secretaria?: string | null
          situacao?: string | null
          tipo_guarda_chuva?: string | null
          updated_at?: string
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "obras_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "obras_credor_id_fkey"
            columns: ["credor_id"]
            isOneToOne: false
            referencedRelation: "credores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "obras_processo_engenharia_id_fkey"
            columns: ["processo_engenharia_id"]
            isOneToOne: false
            referencedRelation: "processos_engenharia"
            referencedColumns: ["id"]
          },
        ]
      }
      parcerias: {
        Row: {
          arquivo_url: string | null
          created_at: string
          data_fim: string | null
          data_inicio: string | null
          entidade: string | null
          id: string
          nome: string
          objeto: string | null
          tipo: string | null
          updated_at: string
          valor: number | null
        }
        Insert: {
          arquivo_url?: string | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          entidade?: string | null
          id?: string
          nome: string
          objeto?: string | null
          tipo?: string | null
          updated_at?: string
          valor?: number | null
        }
        Update: {
          arquivo_url?: string | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          entidade?: string | null
          id?: string
          nome?: string
          objeto?: string | null
          tipo?: string | null
          updated_at?: string
          valor?: number | null
        }
        Relationships: []
      }
      permissoes_modulo: {
        Row: {
          created_at: string
          id: string
          tabela: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          tabela: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          tabela?: string
          user_id?: string
        }
        Relationships: []
      }
      plano_diretor_acoes: {
        Row: {
          created_at: string
          descricao: string | null
          eixo_id: string
          id: string
          nome: string
          plano_id: string
          prazo: string | null
          responsavel: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          eixo_id: string
          id?: string
          nome: string
          plano_id: string
          prazo?: string | null
          responsavel?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          eixo_id?: string
          id?: string
          nome?: string
          plano_id?: string
          prazo?: string | null
          responsavel?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "acao_eixo_mesmo_plano"
            columns: ["plano_id", "eixo_id"]
            isOneToOne: false
            referencedRelation: "plano_diretor_eixos"
            referencedColumns: ["plano_id", "id"]
          },
          {
            foreignKeyName: "plano_diretor_acoes_eixo_id_fkey"
            columns: ["eixo_id"]
            isOneToOne: false
            referencedRelation: "plano_diretor_eixos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plano_diretor_acoes_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "planos_diretores"
            referencedColumns: ["id"]
          },
        ]
      }
      plano_diretor_eixos: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          nome: string
          plano_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          plano_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          plano_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plano_diretor_eixos_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "planos_diretores"
            referencedColumns: ["id"]
          },
        ]
      }
      plano_diretor_equipe: {
        Row: {
          created_at: string
          funcao: string | null
          id: string
          nome: string
          plano_id: string
          representacao: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          funcao?: string | null
          id?: string
          nome: string
          plano_id: string
          representacao?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          funcao?: string | null
          id?: string
          nome?: string
          plano_id?: string
          representacao?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plano_diretor_equipe_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "planos_diretores"
            referencedColumns: ["id"]
          },
        ]
      }
      plano_diretor_fases: {
        Row: {
          created_at: string
          fim: string | null
          id: string
          inicio: string | null
          nome: string
          plano_id: string
          situacao: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          fim?: string | null
          id?: string
          inicio?: string | null
          nome: string
          plano_id: string
          situacao?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          fim?: string | null
          id?: string
          inicio?: string | null
          nome?: string
          plano_id?: string
          situacao?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plano_diretor_fases_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "planos_diretores"
            referencedColumns: ["id"]
          },
        ]
      }
      planos_diretores: {
        Row: {
          arquivo_url: string | null
          created_at: string
          descricao: string | null
          id: string
          lei: string | null
          nome: string
          updated_at: string
        }
        Insert: {
          arquivo_url?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          lei?: string | null
          nome: string
          updated_at?: string
        }
        Update: {
          arquivo_url?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          lei?: string | null
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      processos_engenharia: {
        Row: {
          contrato_id: string
          created_at: string
          data_processo: string
          descricao: string | null
          fonte_recurso: string
          id: string
          numero: string
          updated_at: string
          valor_contrato_inicial: number
        }
        Insert: {
          contrato_id: string
          created_at?: string
          data_processo: string
          descricao?: string | null
          fonte_recurso: string
          id?: string
          numero: string
          updated_at?: string
          valor_contrato_inicial: number
        }
        Update: {
          contrato_id?: string
          created_at?: string
          data_processo?: string
          descricao?: string | null
          fonte_recurso?: string
          id?: string
          numero?: string
          updated_at?: string
          valor_contrato_inicial?: number
        }
        Relationships: [
          {
            foreignKeyName: "processos_engenharia_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          nome: string
          preferencias: Json
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          nome?: string
          preferencias?: Json
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          nome?: string
          preferencias?: Json
        }
        Relationships: []
      }
      publicacoes: {
        Row: {
          acao_emergencial: string | null
          ano: number | null
          arquivo_url: string | null
          beneficiario: string | null
          casos_ativos: number | null
          casos_confirmados: number | null
          categoria: string
          conselho_id: string | null
          created_at: string
          data: string | null
          destino: string | null
          ementa: string | null
          etapas: string | null
          id: string
          justificativa: string | null
          numero: string | null
          obitos: number | null
          orgao: string | null
          recuperados: number | null
          situacao: string | null
          titulo: string
          updated_at: string
          valor: number | null
        }
        Insert: {
          acao_emergencial?: string | null
          ano?: number | null
          arquivo_url?: string | null
          beneficiario?: string | null
          casos_ativos?: number | null
          casos_confirmados?: number | null
          categoria: string
          conselho_id?: string | null
          created_at?: string
          data?: string | null
          destino?: string | null
          ementa?: string | null
          etapas?: string | null
          id?: string
          justificativa?: string | null
          numero?: string | null
          obitos?: number | null
          orgao?: string | null
          recuperados?: number | null
          situacao?: string | null
          titulo: string
          updated_at?: string
          valor?: number | null
        }
        Update: {
          acao_emergencial?: string | null
          ano?: number | null
          arquivo_url?: string | null
          beneficiario?: string | null
          casos_ativos?: number | null
          casos_confirmados?: number | null
          categoria?: string
          conselho_id?: string | null
          created_at?: string
          data?: string | null
          destino?: string | null
          ementa?: string | null
          etapas?: string | null
          id?: string
          justificativa?: string | null
          numero?: string | null
          obitos?: number | null
          orgao?: string | null
          recuperados?: number | null
          situacao?: string | null
          titulo?: string
          updated_at?: string
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "publicacoes_conselho_id_fkey"
            columns: ["conselho_id"]
            isOneToOne: false
            referencedRelation: "conselhos"
            referencedColumns: ["id"]
          },
        ]
      }
      receitas: {
        Row: {
          acao_emergencial: string | null
          ano: number
          arrecadado: number | null
          categoria: string
          chave_externa: string | null
          codigo_receita: string | null
          created_at: string
          data_receita: string | null
          descricao: string | null
          fonte_recurso: string | null
          id: string
          mes: number
          natureza: string | null
          origem: string | null
          previsto: number | null
          updated_at: string
        }
        Insert: {
          acao_emergencial?: string | null
          ano: number
          arrecadado?: number | null
          categoria: string
          chave_externa?: string | null
          codigo_receita?: string | null
          created_at?: string
          data_receita?: string | null
          descricao?: string | null
          fonte_recurso?: string | null
          id?: string
          mes: number
          natureza?: string | null
          origem?: string | null
          previsto?: number | null
          updated_at?: string
        }
        Update: {
          acao_emergencial?: string | null
          ano?: number
          arrecadado?: number | null
          categoria?: string
          chave_externa?: string | null
          codigo_receita?: string | null
          created_at?: string
          data_receita?: string | null
          descricao?: string | null
          fonte_recurso?: string | null
          id?: string
          mes?: number
          natureza?: string | null
          origem?: string | null
          previsto?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      secretarias: {
        Row: {
          created_at: string
          descricao: string | null
          email: string | null
          endereco: string | null
          horario: string | null
          id: string
          nome: string
          secretario: string | null
          sigla: string | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          email?: string | null
          endereco?: string | null
          horario?: string | null
          id?: string
          nome: string
          secretario?: string | null
          sigla?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          email?: string | null
          endereco?: string | null
          horario?: string | null
          id?: string
          nome?: string
          secretario?: string | null
          sigla?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      servico_avaliacoes: {
        Row: {
          comentario: string | null
          created_at: string
          id: string
          nota: number
          servico_id: string
          util: boolean | null
        }
        Insert: {
          comentario?: string | null
          created_at?: string
          id?: string
          nota: number
          servico_id: string
          util?: boolean | null
        }
        Update: {
          comentario?: string | null
          created_at?: string
          id?: string
          nota?: number
          servico_id?: string
          util?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "servico_avaliacoes_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "servicos"
            referencedColumns: ["id"]
          },
        ]
      }
      servicos: {
        Row: {
          anexo_url: string | null
          created_at: string
          custo: string | null
          descricao: string | null
          etapas: string | null
          id: string
          link: string | null
          nome: string
          parecer_ouvidor: string | null
          parecer_status: string | null
          perfil_atendimento: string | null
          prazo: string | null
          publico: string | null
          requisitos: string | null
          secretaria: string | null
          tags: string[] | null
          updated_at: string
          visualizacoes: number
        }
        Insert: {
          anexo_url?: string | null
          created_at?: string
          custo?: string | null
          descricao?: string | null
          etapas?: string | null
          id?: string
          link?: string | null
          nome: string
          parecer_ouvidor?: string | null
          parecer_status?: string | null
          perfil_atendimento?: string | null
          prazo?: string | null
          publico?: string | null
          requisitos?: string | null
          secretaria?: string | null
          tags?: string[] | null
          updated_at?: string
          visualizacoes?: number
        }
        Update: {
          anexo_url?: string | null
          created_at?: string
          custo?: string | null
          descricao?: string | null
          etapas?: string | null
          id?: string
          link?: string | null
          nome?: string
          parecer_ouvidor?: string | null
          parecer_status?: string | null
          perfil_atendimento?: string | null
          prazo?: string | null
          publico?: string | null
          requisitos?: string | null
          secretaria?: string | null
          tags?: string[] | null
          updated_at?: string
          visualizacoes?: number
        }
        Relationships: []
      }
      servidores: {
        Row: {
          acao_emergencial: string | null
          admissao: string | null
          cargo: string | null
          chave_externa: string | null
          competencia: string | null
          created_at: string
          descontos: number | null
          id: string
          lotacao: string | null
          matricula: string | null
          nome: string
          origem: string | null
          remuneracao: number | null
          subsidio: number | null
          updated_at: string
          vantagens: number | null
          vinculo: string | null
        }
        Insert: {
          acao_emergencial?: string | null
          admissao?: string | null
          cargo?: string | null
          chave_externa?: string | null
          competencia?: string | null
          created_at?: string
          descontos?: number | null
          id?: string
          lotacao?: string | null
          matricula?: string | null
          nome: string
          origem?: string | null
          remuneracao?: number | null
          subsidio?: number | null
          updated_at?: string
          vantagens?: number | null
          vinculo?: string | null
        }
        Update: {
          acao_emergencial?: string | null
          admissao?: string | null
          cargo?: string | null
          chave_externa?: string | null
          competencia?: string | null
          created_at?: string
          descontos?: number | null
          id?: string
          lotacao?: string | null
          matricula?: string | null
          nome?: string
          origem?: string | null
          remuneracao?: number | null
          subsidio?: number | null
          updated_at?: string
          vantagens?: number | null
          vinculo?: string | null
        }
        Relationships: []
      }
      solicitacoes_melhoria: {
        Row: {
          created_at: string
          descricao: string
          id: string
          modulo: string | null
          prioridade: string
          resposta: string | null
          status: string
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          descricao: string
          id?: string
          modulo?: string | null
          prioridade?: string
          resposta?: string | null
          status?: string
          titulo: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          descricao?: string
          id?: string
          modulo?: string | null
          prioridade?: string
          resposta?: string | null
          status?: string
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      termos_fomento: {
        Row: {
          arquivo_url: string | null
          cnpj: string | null
          created_at: string
          data_fim: string | null
          data_inicio: string | null
          id: string
          numero: string
          objeto: string | null
          osc: string
          updated_at: string
          valor: number | null
        }
        Insert: {
          arquivo_url?: string | null
          cnpj?: string | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          numero: string
          objeto?: string | null
          osc: string
          updated_at?: string
          valor?: number | null
        }
        Update: {
          arquivo_url?: string | null
          cnpj?: string | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          numero?: string
          objeto?: string | null
          osc?: string
          updated_at?: string
          valor?: number | null
        }
        Relationships: []
      }
      unidades_gestoras: {
        Row: {
          cnpj: string | null
          codigo: string | null
          created_at: string
          id: string
          nome: string
          responsavel: string | null
          secretaria: string | null
          tipo: string | null
          updated_at: string
        }
        Insert: {
          cnpj?: string | null
          codigo?: string | null
          created_at?: string
          id?: string
          nome: string
          responsavel?: string | null
          secretaria?: string | null
          tipo?: string | null
          updated_at?: string
        }
        Update: {
          cnpj?: string | null
          codigo?: string | null
          created_at?: string
          id?: string
          nome?: string
          responsavel?: string | null
          secretaria?: string | null
          tipo?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      veiculos: {
        Row: {
          ano: number | null
          baixa_frota: string | null
          combustivel: string | null
          created_at: string
          entrada_frota: string | null
          finalidade: string | null
          foto_url: string | null
          id: string
          ipva_vencimento: string | null
          manutencao_prevista: string | null
          maquina_obra: boolean
          modelo: string
          placa: string
          renavam: string | null
          secretaria: string | null
          seguro_vencimento: string | null
          situacao: string | null
          tipo: string | null
          updated_at: string
        }
        Insert: {
          ano?: number | null
          baixa_frota?: string | null
          combustivel?: string | null
          created_at?: string
          entrada_frota?: string | null
          finalidade?: string | null
          foto_url?: string | null
          id?: string
          ipva_vencimento?: string | null
          manutencao_prevista?: string | null
          maquina_obra?: boolean
          modelo: string
          placa: string
          renavam?: string | null
          secretaria?: string | null
          seguro_vencimento?: string | null
          situacao?: string | null
          tipo?: string | null
          updated_at?: string
        }
        Update: {
          ano?: number | null
          baixa_frota?: string | null
          combustivel?: string | null
          created_at?: string
          entrada_frota?: string | null
          finalidade?: string | null
          foto_url?: string | null
          id?: string
          ipva_vencimento?: string | null
          manutencao_prevista?: string | null
          maquina_obra?: boolean
          modelo?: string
          placa?: string
          renavam?: string | null
          secretaria?: string | null
          seguro_vencimento?: string | null
          situacao?: string | null
          tipo?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_listar_usuarios: {
        Args: never
        Returns: {
          created_at: string
          email: string
          id: string
          nome: string
          roles: string[]
        }[]
      }
      avaliar_servico: {
        Args: {
          _comentario: string
          _nota: number
          _servico: string
          _util: boolean
        }
        Returns: undefined
      }
      consultar_protocolo: {
        Args: { _protocolo: string }
        Returns: {
          assunto: string
          canal: string
          created_at: string
          protocolo: string
          respondido_em: string
          resposta: string
          status: string
        }[]
      }
      consultar_protocolo_seguro: {
        Args: { _email: string; _protocolo: string }
        Returns: {
          assunto: string
          canal: string
          created_at: string
          justificativa_prorrogacao: string
          prazo_final: string
          prorrogado: boolean
          protocolo: string
          protocolo_origem: string
          respondido_em: string
          resposta: string
          setor_destino: string
          status: string
        }[]
      }
      encaminhar_atendimento: {
        Args: { _id: string; _setor: string }
        Returns: undefined
      }
      estatisticas_atendimentos: {
        Args: never
        Returns: {
          canal: string
          status: string
          total: number
        }[]
      }
      estatisticas_servicos: {
        Args: never
        Returns: {
          avaliacoes: number
          media: number
          servico_id: string
          uteis: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      importar_dados_poc: {
        Args: { _linhas: Json; _modulo: string; _origem: string }
        Returns: number
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      pode_editar: {
        Args: { _tabela: string; _user_id: string }
        Returns: boolean
      }
      prorrogar_esic: {
        Args: { _id: string; _justificativa: string }
        Returns: undefined
      }
      recalcular_contrato: { Args: { _numero: string }; Returns: undefined }
      registrar_acesso: { Args: { _evento: string }; Returns: undefined }
      registrar_atendimento: {
        Args: {
          _anonimo: boolean
          _assunto: string
          _canal: string
          _email: string
          _mensagem: string
          _nome: string
          _telefone: string
          _tipo: string
        }
        Returns: string
      }
      registrar_recurso_esic: {
        Args: { _email: string; _mensagem: string; _protocolo: string }
        Returns: string
      }
      registrar_visualizacao: { Args: { _slug: string }; Returns: undefined }
      registrar_visualizacao_servico: {
        Args: { _id: string }
        Returns: undefined
      }
      responder_atendimento: {
        Args: { _id: string; _resposta: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "editor"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "editor"],
    },
  },
} as const
