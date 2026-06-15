import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../context/AuthContext'
import { ROLES } from '../utils/constants'

export function useUnit(unitName) {
  const { user, profile } = useAuthContext()
  const [unit, setUnit] = useState(null)
  const [parentUnit, setParentUnit] = useState(null)
  const [unitUsage, setUnitUsage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchUnit = useCallback(async () => {
    if (!unitName || !user) {
      setUnit(null)
      setParentUnit(null)
      setUnitUsage(null)
      setLoading(false)
      return
    }

    setLoading(true)

    const { data: unitData, error: unitError } = await supabase
      .from('units')
      .select('id, name, parent_id, manager_id')
      .eq('name', unitName)
      .maybeSingle()

    if (unitError || !unitData) {
      setError(unitError ? '유닛 정보를 불러오지 못했습니다.' : null)
      setUnit(null)
      setParentUnit(null)
      setUnitUsage(null)
      setLoading(false)
      return
    }

    setError(null)
    setUnit(unitData)

    let parent = null
    if (unitData.parent_id) {
      const { data: parentData } = await supabase
        .from('units')
        .select('id, name, parent_id, manager_id')
        .eq('id', unitData.parent_id)
        .maybeSingle()
      parent = parentData ?? null
    }
    setParentUnit(parent)

    const isManager =
      profile?.role === ROLES.ADMIN ||
      unitData.manager_id === user.id ||
      parent?.manager_id === user.id

    if (isManager) {
      const { data: members, error: membersError } = await supabase
        .from('profiles')
        .select('used_amount, current_limit')
        .eq('unit_id', unitData.id)

      if (!membersError && members) {
        setUnitUsage(
          members.reduce(
            (acc, member) => ({
              used: acc.used + Number(member.used_amount ?? 0),
              limit: acc.limit + Number(member.current_limit ?? 0),
            }),
            { used: 0, limit: 0 }
          )
        )
      } else {
        setUnitUsage(null)
      }
    } else {
      setUnitUsage(null)
    }

    setLoading(false)
  }, [unitName, user, profile?.role])

  useEffect(() => {
    fetchUnit()
  }, [fetchUnit])

  const isUnitManager =
    !!unit &&
    (profile?.role === ROLES.ADMIN ||
      unit.manager_id === user?.id ||
      parentUnit?.manager_id === user?.id)

  return { unit, isUnitManager, unitUsage, loading, error, refetch: fetchUnit }
}
