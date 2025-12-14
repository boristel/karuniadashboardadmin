/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "sharp$": false
    }

    // Exclude Google Maps from webpack processing
    config.externals = config.externals || []
    config.externals.push({
      'google.maps': 'google.maps'
    })

    return config
  }
}

module.exports = nextConfig