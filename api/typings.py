from typing import Literal

from sqlalchemy.ext.asyncio import AsyncSession as AsyncDbSession

# force IDE heuristics to think this is exported by the module so we get suggested it
AsyncDbSession = AsyncDbSession
BooleanFunction = Literal["and"]