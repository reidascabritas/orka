import httpx
import hmac
import hashlib
from app.core.config import settings


class ShopifyIntegration:
    platform = "shopify"
    SCOPES = "read_orders,read_products,read_inventory,read_analytics"

    def __init__(self, shop: str, access_token: str = ""):
        self.shop = shop.rstrip("/")
        self.access_token = access_token
        self.base = f"https://{self.shop}/admin/api/2024-01"

    @staticmethod
    def get_auth_url(shop: str, state: str = "orka") -> str:
        shop = shop.rstrip("/")
        return (
            f"https://{shop}/admin/oauth/authorize"
            f"?client_id={settings.SHOPIFY_CLIENT_ID}"
            f"&scope={ShopifyIntegration.SCOPES}"
            f"&redirect_uri={settings.SHOPIFY_REDIRECT_URI}"
            f"&state={state}"
        )

    @staticmethod
    def verify_hmac(params: dict) -> bool:
        """Valida a assinatura do callback do Shopify."""
        hmac_value = params.pop("hmac", "")
        message = "&".join(f"{k}={v}" for k, v in sorted(params.items()))
        digest = hmac.new(
            settings.SHOPIFY_CLIENT_SECRET.encode(),
            message.encode(),
            hashlib.sha256,
        ).hexdigest()
        return hmac.compare_digest(digest, hmac_value)

    @staticmethod
    async def exchange_code(shop: str, code: str) -> dict:
        async with httpx.AsyncClient() as c:
            r = await c.post(
                f"https://{shop}/admin/oauth/access_token",
                json={
                    "client_id":     settings.SHOPIFY_CLIENT_ID,
                    "client_secret": settings.SHOPIFY_CLIENT_SECRET,
                    "code":          code,
                },
            )
            r.raise_for_status()
            data = r.json()
            return {
                "access_token": data["access_token"],
                "scope":        data.get("scope", ""),
                "shop":         shop,
            }

    def _headers(self) -> dict:
        return {"X-Shopify-Access-Token": self.access_token}

    async def get_shop_info(self) -> dict:
        async with httpx.AsyncClient() as c:
            r = await c.get(f"{self.base}/shop.json", headers=self._headers())
            r.raise_for_status()
            return r.json().get("shop", {})

    async def get_orders(self, limit: int = 50) -> list[dict]:
        async with httpx.AsyncClient() as c:
            r = await c.get(
                f"{self.base}/orders.json",
                headers=self._headers(),
                params={"limit": limit, "status": "any"},
            )
            r.raise_for_status()
            return [{
                "external_id":  str(o["id"]),
                "date":         o.get("created_at"),
                "total_amount": float(o.get("total_price", 0)),
                "status":       o.get("financial_status", ""),
                "channel":      "shopify",
                "customer":     o.get("email", ""),
            } for o in r.json().get("orders", [])]

    async def get_products(self) -> list[dict]:
        async with httpx.AsyncClient() as c:
            r = await c.get(
                f"{self.base}/products.json",
                headers=self._headers(),
                params={"limit": 50},
            )
            r.raise_for_status()
            products = []
            for p in r.json().get("products", []):
                for v in p.get("variants", []):
                    products.append({
                        "external_id": str(v["id"]),
                        "name":        p["title"],
                        "sku":         v.get("sku", ""),
                        "price":       float(v.get("price", 0)),
                        "variant":     v.get("title", ""),
                    })
            return products

    async def get_inventory(self) -> list[dict]:
        async with httpx.AsyncClient() as c:
            # pega locations primeiro
            rl = await c.get(f"{self.base}/locations.json", headers=self._headers())
            rl.raise_for_status()
            locations = rl.json().get("locations", [])
            if not locations:
                return []

            loc_id = locations[0]["id"]
            r = await c.get(
                f"{self.base}/inventory_levels.json",
                headers=self._headers(),
                params={"location_ids": loc_id, "limit": 100},
            )
            r.raise_for_status()
            return [{
                "inventory_item_id": str(i["inventory_item_id"]),
                "available":         i.get("available", 0),
                "location_id":       str(i["location_id"]),
            } for i in r.json().get("inventory_levels", [])]
