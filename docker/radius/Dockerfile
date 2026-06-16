FROM ubuntu:22.04

# Prevent interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Install FreeRADIUS, MySQL module and utilities
RUN apt-get update && apt-get install -y \
    freeradius \
    freeradius-mysql \
    freeradius-utils \
    mysql-client \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy entrypoint script
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Expose RADIUS ports
EXPOSE 1812/udp 1813/udp

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
