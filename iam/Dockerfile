FROM quay.io/keycloak/keycloak:26.7.0 AS builder

ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true
ENV KC_DB=postgres
ENV KC_FEATURES_DISABLED=identity-brokering-api,twitter-broker

RUN /opt/keycloak/bin/kc.sh build

FROM quay.io/keycloak/keycloak:26.7.0

COPY --from=builder /opt/keycloak/ /opt/keycloak/

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
