import kmd from '../../lib/kmd'
import linuxFriendlyName from './LinuxDeviceName'

export default {
  async friendlyName (root, args, context) {
    const result = await kmd('hardware', context)
    const hardwareModel = result.system.hardwareVersion
    return linuxFriendlyName(hardwareModel)
  },
  async disks (root, args, context) {
    const { disks } = await kmd('disks', context)
    // ignore spammy squashfs volumes, typically generated by Snap applications
    const volumes = (disks.volumes || []).filter(vol => vol.type !== 'squashfs')

    // set encrypted flag for LUKS volumes
    volumes.forEach(vol => { vol.encrypted = vol.type === 'crypto_LUKS' });

    return volumes
  }
}
