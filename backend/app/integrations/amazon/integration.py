"""
Amazon SP-API integration — placeholder.
Implementação completa requer credenciais AWS (LWA Client ID/Secret + IAM Role).
"""


class AmazonIntegration:
    platform = "amazon"

    @staticmethod
    def get_auth_url(state: str = "") -> str:
        raise NotImplementedError("Integração Amazon ainda não implementada")
