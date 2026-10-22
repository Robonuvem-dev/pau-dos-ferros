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
          created_at: string
          email: string | null
          foto_url: string | null
          id: string
          nome: string
          ordem: number | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          biografia?: string | null
          cargo: string
          created_at?: string
          email?: string | null
          foto_url?: string | null
          id?: string
          nome: string
          ordem?: number | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          biografia?: string | null
          cargo?: string
          created_at?: string
          email?: string | null
          foto_url?: string | null
          id?: string
          nome?: string
          ordem?: number | null
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
          titulo?: string
          updated_at?: string
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
          mensagem: string
          nome: string | null
          protocolo: string
          respondido_em: string | null
          resposta: string | null
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
          mensagem: string
          nome?: string | null
          protocolo?: string
          respondido_em?: string | null
          resposta?: string | null
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
          mensagem?: string
          nome?: string | null
          protocolo?: string
          respondido_em?: string | null
          resposta?: string | null
          status?: string
          telefone?: string | null
          tipo?: string | null
          updated_at?: string
        }
        Relationships: []
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
          id: string
          imagem_url: string | null
          link: string | null
          ordem: number | null
          titulo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          id?: string
          imagem_url?: string | null
          link?: string | null
          ordem?: number | null
          titulo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          id?: string
          imagem_url?: string | null
          link?: string | null
          ordem?: number | null
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      conselhos: {
        Row: {
          contato: string | null
          created_at: string
          descricao: string | null
          id: string
          lei_criacao: string | null
          membros: string | null
          nome: string
          presidente: string | null
          sigla: string | null
          updated_at: string
        }
        Insert: {
          contato?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          lei_criacao?: string | null
          membros?: string | null
          nome: string
          presidente?: string | null
          sigla?: string | null
          updated_at?: string
        }
        Update: {
          contato?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          lei_criacao?: string | null
          membros?: string | null
          nome?: string
          presidente?: string | null
          sigla?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      contratos: {
        Row: {
          arquivo_url: string | null
          cnpj: string | null
          created_at: string
          data_fim: string | null
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
        }
        Insert: {
          arquivo_url?: string | null
          cnpj?: string | null
          created_at?: string
          data_fim?: string | null
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
        }
        Update: {
          arquivo_url?: string | null
          cnpj?: string | null
          created_at?: string
          data_fim?: string | null
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
        }
        Relationships: []
      }
      convenios: {
        Row: {
          arquivo_url: string | null
          concedente: string
          contrapartida: number | null
          convenente: string | null
          created_at: string
          data_fim: string | null
          data_inicio: string | null
          id: string
          numero: string
          objeto: string
          situacao: string | null
          tipo: string | null
          updated_at: string
          valor: number | null
        }
        Insert: {
          arquivo_url?: string | null
          concedente: string
          contrapartida?: number | null
          convenente?: string | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          numero: string
          objeto: string
          situacao?: string | null
          tipo?: string | null
          updated_at?: string
          valor?: number | null
        }
        Update: {
          arquivo_url?: string | null
          concedente?: string
          contrapartida?: number | null
          convenente?: string | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          numero?: string
          objeto?: string
          situacao?: string | null
          tipo?: string | null
          updated_at?: string
          valor?: number | null
        }
        Relationships: []
      }
      credores: {
        Row: {
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
          ano: number
          created_at: string
          credor: string | null
          elemento: string | null
          empenhado: number | null
          empenho: string | null
          funcao: string | null
          id: string
          liquidado: number | null
          mes: number
          orgao: string
          pago: number | null
          updated_at: string
        }
        Insert: {
          ano: number
          created_at?: string
          credor?: string | null
          elemento?: string | null
          empenhado?: number | null
          empenho?: string | null
          funcao?: string | null
          id?: string
          liquidado?: number | null
          mes: number
          orgao: string
          pago?: number | null
          updated_at?: string
        }
        Update: {
          ano?: number
          created_at?: string
          credor?: string | null
          elemento?: string | null
          empenhado?: number | null
          empenho?: string | null
          funcao?: string | null
          id?: string
          liquidado?: number | null
          mes?: number
          orgao?: string
          pago?: number | null
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
      noticias: {
        Row: {
          audio_url: string | null
          capa_url: string | null
          categoria: string | null
          conteudo: string | null
          created_at: string
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
          audio_url?: string | null
          capa_url?: string | null
          categoria?: string | null
          conteudo?: string | null
          created_at?: string
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
          audio_url?: string | null
          capa_url?: string | null
          categoria?: string | null
          conteudo?: string | null
          created_at?: string
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
      obras: {
        Row: {
          art: string | null
          created_at: string
          data_inicio: string | null
          descricao: string | null
          empresa: string | null
          fotos: string[] | null
          id: string
          local: string | null
          nome: string
          percentual: number | null
          previsao_fim: string | null
          situacao: string | null
          updated_at: string
          valor: number | null
        }
        Insert: {
          art?: string | null
          created_at?: string
          data_inicio?: string | null
          descricao?: string | null
          empresa?: string | null
          fotos?: string[] | null
          id?: string
          local?: string | null
          nome: string
          percentual?: number | null
          previsao_fim?: string | null
          situacao?: string | null
          updated_at?: string
          valor?: number | null
        }
        Update: {
          art?: string | null
          created_at?: string
          data_inicio?: string | null
          descricao?: string | null
          empresa?: string | null
          fotos?: string[] | null
          id?: string
          local?: string | null
          nome?: string
          percentual?: number | null
          previsao_fim?: string | null
          situacao?: string | null
          updated_at?: string
          valor?: number | null
        }
        Relationships: []
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
          ano: number | null
          arquivo_url: string | null
          categoria: string
          created_at: string
          data: string | null
          ementa: string | null
          id: string
          numero: string | null
          orgao: string | null
          titulo: string
          updated_at: string
          valor: number | null
        }
        Insert: {
          ano?: number | null
          arquivo_url?: string | null
          categoria: string
          created_at?: string
          data?: string | null
          ementa?: string | null
          id?: string
          numero?: string | null
          orgao?: string | null
          titulo: string
          updated_at?: string
          valor?: number | null
        }
        Update: {
          ano?: number | null
          arquivo_url?: string | null
          categoria?: string
          created_at?: string
          data?: string | null
          ementa?: string | null
          id?: string
          numero?: string | null
          orgao?: string | null
          titulo?: string
          updated_at?: string
          valor?: number | null
        }
        Relationships: []
      }
      receitas: {
        Row: {
          ano: number
          arrecadado: number | null
          categoria: string
          created_at: string
          descricao: string | null
          id: string
          mes: number
          previsto: number | null
          updated_at: string
        }
        Insert: {
          ano: number
          arrecadado?: number | null
          categoria: string
          created_at?: string
          descricao?: string | null
          id?: string
          mes: number
          previsto?: number | null
          updated_at?: string
        }
        Update: {
          ano?: number
          arrecadado?: number | null
          categoria?: string
          created_at?: string
          descricao?: string | null
          id?: string
          mes?: number
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
      servicos: {
        Row: {
          created_at: string
          custo: string | null
          descricao: string | null
          id: string
          link: string | null
          nome: string
          prazo: string | null
          publico: string | null
          requisitos: string | null
          secretaria: string | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          custo?: string | null
          descricao?: string | null
          id?: string
          link?: string | null
          nome: string
          prazo?: string | null
          publico?: string | null
          requisitos?: string | null
          secretaria?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          custo?: string | null
          descricao?: string | null
          id?: string
          link?: string | null
          nome?: string
          prazo?: string | null
          publico?: string | null
          requisitos?: string | null
          secretaria?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      servidores: {
        Row: {
          admissao: string | null
          cargo: string | null
          competencia: string | null
          created_at: string
          id: string
          lotacao: string | null
          matricula: string | null
          nome: string
          remuneracao: number | null
          updated_at: string
          vinculo: string | null
        }
        Insert: {
          admissao?: string | null
          cargo?: string | null
          competencia?: string | null
          created_at?: string
          id?: string
          lotacao?: string | null
          matricula?: string | null
          nome: string
          remuneracao?: number | null
          updated_at?: string
          vinculo?: string | null
        }
        Update: {
          admissao?: string | null
          cargo?: string | null
          competencia?: string | null
          created_at?: string
          id?: string
          lotacao?: string | null
          matricula?: string | null
          nome?: string
          remuneracao?: number | null
          updated_at?: string
          vinculo?: string | null
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
          combustivel: string | null
          created_at: string
          id: string
          modelo: string
          placa: string
          secretaria: string | null
          situacao: string | null
          tipo: string | null
          updated_at: string
        }
        Insert: {
          ano?: number | null
          combustivel?: string | null
          created_at?: string
          id?: string
          modelo: string
          placa: string
          secretaria?: string | null
          situacao?: string | null
          tipo?: string | null
          updated_at?: string
        }
        Update: {
          ano?: number | null
          combustivel?: string | null
          created_at?: string
          id?: string
          modelo?: string
          placa?: string
          secretaria?: string | null
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
      estatisticas_atendimentos: {
        Args: never
        Returns: {
          canal: string
          status: string
          total: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
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
      registrar_visualizacao: { Args: { _slug: string }; Returns: undefined }
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
